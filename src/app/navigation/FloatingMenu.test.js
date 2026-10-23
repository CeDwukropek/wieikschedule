import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import FloatingMenu from "./FloatingMenu";
import { useChatbot } from "../../features/chat/useChatbot";

jest.mock("../../features/settings/SettingsPanel", () => () => null);
jest.mock("../../features/chat/useChatbot");
jest.mock("react-markdown", () => ({ children }) => <div>{children}</div>);
jest.mock("remark-gfm", () => () => {});
jest.mock("../../features/chat/SlotChoicesMessage", () => () => null);

function createProps(viewMode = "week", enabled = true) {
  return {
    panelState: { open: false, setOpen: jest.fn() },
    viewState: { viewMode, setViewMode: jest.fn() },
    weekNavigation: {
      onPrevWeek: jest.fn(), onResetWeek: jest.fn(), onNextWeek: jest.fn(),
      viewedWeekRange: "31.08 - 04.09", isCurrentWeek: true,
      canGoPrevWeek: false, canGoNextWeek: true,
    },
    dayNavigation: {
      onPrevDay: jest.fn(), onResetDay: jest.fn(), onNextDay: jest.fn(),
      currentDayLabel: "Piątek 04.09", isCurrentDay: false,
      canGoPrevDay: true, canGoNextDay: false,
    },
    weekSelection: {
      options: [{ value: 0, label: "31.08 - 04.09" }, { value: 1, label: "07.09 - 11.09" }],
      selection: 0, onChange: jest.fn(),
    },
    daySelection: {
      options: [{ value: "0:4", label: "Piątek", date: "04.09" }, { value: "1:0", label: "Poniedziałek", date: "07.09" }],
      selection: "0:4", onChange: jest.fn(),
    },
    scheduleState: { currentSchedule: "Informatyka", onRefreshSchedule: jest.fn().mockResolvedValue() },
    chatState: { enabled },
  };
}

beforeEach(() => {
  HTMLElement.prototype.scrollTo = jest.fn();
  HTMLElement.prototype.scrollIntoView = jest.fn();
  useChatbot.mockReturnValue({
    input: "", setInput: jest.fn(), messages: [], status: "idle", canSend: false,
    sendMessage: jest.fn(), clearConversation: jest.fn(), resetError: jest.fn(),
  });
});

test.each([true, false])("today and week navigation remain available with AI enabled=%s", (enabled) => {
  const props = createProps("week", enabled);
  render(<FloatingMenu {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Wróć do bieżącego tygodnia" }));
  expect(props.weekNavigation.onResetWeek).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Poprzedni tydzień" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Następny tydzień" }));
  expect(props.weekNavigation.onNextWeek).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Przełącz na widok dnia" }));
  expect(props.viewState.setViewMode).toHaveBeenCalledWith("day");
});

test("day view uses day actions and opens the side menu", () => {
  const props = createProps("day");
  render(<FloatingMenu {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Wróć do dzisiaj" }));
  fireEvent.click(screen.getByRole("button", { name: "Poprzedni dzień" }));
  expect(props.dayNavigation.onResetDay).toHaveBeenCalledTimes(1);
  expect(props.dayNavigation.onPrevDay).toHaveBeenCalledTimes(1);
  expect(props.weekNavigation.onResetWeek).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Następny dzień" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Przełącz na widok tygodnia" }));
  expect(props.viewState.setViewMode).toHaveBeenCalledWith("week");
  fireEvent.click(screen.getByRole("button", { name: "Otwórz menu" }));
  expect(props.panelState.setOpen).toHaveBeenCalledWith(true);
});

test.each(["day", "week"])("date picker opens on one click and selects a %s", async (mode) => {
  const props = createProps(mode);
  render(<FloatingMenu {...props} />);
  const trigger = screen.getByRole("button", { name: /Wybierz/ });
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  const group = screen.getByRole("group", { name: /Wybierz/ });
  const options = within(group).getAllByRole("button");
  await waitFor(() => expect(options[0]).toHaveFocus());
  fireEvent.keyDown(options[0], { key: "ArrowDown" });
  expect(options[1]).toHaveFocus();
  fireEvent.click(options[1]);
  expect(mode === "week" ? props.weekSelection.onChange : props.daySelection.onChange)
    .toHaveBeenCalledWith(mode === "week" ? 1 : "1:0");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
});

test("date picker dismisses on Escape and outside click", () => {
  render(<FloatingMenu {...createProps()} />);
  const trigger = screen.getByRole("button", { name: /Wybierz/ });
  fireEvent.click(trigger);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(trigger);
  fireEvent.pointerDown(document.body);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("manual refresh prevents duplicate requests and reports failure", async () => {
  const props = createProps();
  let reject;
  props.scheduleState.onRefreshSchedule.mockImplementation(() => new Promise((resolve, fail) => { reject = fail; }));
  render(<FloatingMenu {...props} />);
  const refresh = screen.getByRole("button", { name: "Odśwież plan" });
  fireEvent.click(refresh);
  fireEvent.click(refresh);
  expect(props.scheduleState.onRefreshSchedule).toHaveBeenCalledTimes(1);
  reject(new Error("Brak połączenia"));
  expect(await screen.findByText("Brak połączenia")).toBeInTheDocument();
  props.scheduleState.onRefreshSchedule.mockResolvedValue();
  fireEvent.click(refresh);
  expect(await screen.findByText("Plan jest aktualny")).toBeInTheDocument();
});

test("the same navigation opens chat with history expanded and keeps its side buttons", () => {
  const chat = { ...useChatbot(), input: "Kiedy mam zajęcia?", canSend: true };
  useChatbot.mockReturnValue(chat);
  render(<FloatingMenu {...createProps()} />);
  const navigation = screen.getByRole("navigation");
  const leftButton = screen.getByRole("button", { name: "Odśwież plan" });
  const rightButton = screen.getByRole("button", { name: "Otwórz AI chat" });
  fireEvent.click(rightButton);
  expect(screen.getByRole("textbox", { name: "Wiadomość do AI" })).toHaveFocus();
  expect(screen.getByRole("navigation")).toBe(navigation);
  expect(screen.getByRole("button", { name: "Wróć do nawigacji planu" })).toBe(leftButton);
  expect(screen.getByRole("button", { name: "Wyślij wiadomość" })).toBe(rightButton);
  expect(screen.getByRole("region", { name: "Rozmowa z AI" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Zwiń chat" })).toHaveAttribute("aria-expanded", "true");
  expect(chat.sendMessage).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Wyślij wiadomość" }));
  expect(chat.sendMessage).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("region", { name: "Rozmowa z AI" })).toBeInTheDocument();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.getByRole("button", { name: "Rozwiń chat" })).toHaveFocus();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.getByRole("button", { name: "Odśwież plan" })).toHaveFocus();
  expect(screen.getByRole("navigation")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Otwórz AI chat" }));
  expect(screen.getByRole("textbox")).toHaveValue("Kiedy mam zajęcia?");
  expect(screen.getByRole("region", { name: "Rozmowa z AI" })).toBeInTheDocument();
});

test("collapsing history preserves the draft and messages, and reopening chat expands it again", () => {
  useChatbot.mockReturnValue({
    ...useChatbot(), input: "Niedokończone pytanie", canSend: true,
    messages: [{ id: "reply", role: "assistant", text: "Twoja odpowiedź", stage: "done" }],
  });
  render(<FloatingMenu {...createProps()} />);
  fireEvent.click(screen.getByRole("button", { name: "Otwórz AI chat" }));
  const input = screen.getByRole("textbox");
  const history = screen.getByRole("region", { name: "Rozmowa z AI" });
  fireEvent.click(screen.getByRole("button", { name: "Zwiń chat" }));
  expect(screen.queryByRole("region", { name: "Rozmowa z AI" })).not.toBeInTheDocument();
  expect(screen.getByRole("textbox")).toBe(input);
  fireEvent.click(screen.getByRole("button", { name: "Rozwiń chat" }));
  expect(screen.getByRole("region", { name: "Rozmowa z AI" })).toBe(history);
  expect(screen.getByText("Twoja odpowiedź")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Zwiń chat" }));
  fireEvent.click(screen.getByRole("button", { name: "Wróć do nawigacji planu" }));
  fireEvent.click(screen.getByRole("button", { name: "Otwórz AI chat" }));
  expect(screen.getByRole("button", { name: "Zwiń chat" })).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("textbox")).toHaveValue("Niedokończone pytanie");
});
