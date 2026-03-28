import ControlsPanel from "../ControlsPanel";

export function FloatingSettingsPanel({
  open,
  currentSchedule,
  onScheduleChange,
  isScheduleLoading = false,
  activeGroupSetId,
  activeGroupSetName,
  groupSetOptions = [],
  onGroupSetChange,
  onCreateGroupSet,
  onRenameActiveGroupSet,
  onDeleteActiveGroupSet,
  viewMode,
  setViewMode,
  hideLectures,
  setHideLectures,
  showAll,
  setShowAll,
  groupConfigs = [],
  studentGroups,
  handleGroupChange,
  shouldShowLectoratSelect,
  selectedLectoratSubject,
  onLectoratChange,
  lektoratOptions = [],
  setOpen,
  computeFiltered,
  schedule,
  viewedWeekStart,
  exportRef,
  viewedWeekRange,
  selection,
  options = [],
}) {
  return (
    //TODO: This coponent is not necessary and can be removed, haven't figure out how tho
    <ControlsPanel
      panelState={{
        isOpen: open,
        onToggle: () => setOpen(false),
        mobileFloatingClose: true,
      }}
      scheduleState={{
        currentSchedule,
        onScheduleChange,
        isScheduleLoading,
      }}
      groupSetState={{
        activeGroupSetId,
        activeGroupSetName,
        groupSetOptions,
        onGroupSetChange,
        onCreateGroupSet,
        onRenameActiveGroupSet,
        onDeleteActiveGroupSet,
      }}
      viewState={{
        viewMode,
        onViewModeToggle: () =>
          setViewMode((prev) => (prev === "week" ? "day" : "week")),
        hideLectures,
        onToggleHideLectures: () => setHideLectures((prev) => !prev),
        showAll,
        onToggleShowAll: () => setShowAll((prev) => !prev),
      }}
      filterState={{
        schedule,
        studentGroups,
        computeFiltered,
        groupConfigs,
        onGroupChange: handleGroupChange,
      }}
      lektoratState={{
        shouldShowLectoratSelect,
        selectedLectoratSubject,
        onLectoratChange,
        lektoratOptions,
      }}
      exportState={{
        exportRef,
        viewedWeekRange,
        selection,
        combinedOptions: options,
      }}
    />
  );
}
