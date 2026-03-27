import { FloatingBottomNavigation } from "./FloatingBottomNavigation";
import { FloatingSettingsPanel } from "./FloatingSettingsPanel";

export default function FloatingMenu({
  panelState,
  viewState,
  groupState,
  weekNavigation,
  daySelection,
  dayNavigation,
  filtering,
  scheduleState,
  lektoratState,
  exportState,
}) {
  const { open, setOpen, isControlsPanelOpen = false } = panelState || {};
  const {
    viewMode,
    setViewMode,
    hideLectures,
    setHideLectures,
    showAll,
    setShowAll,
  } = viewState || {};
  const {
    studentGroups,
    groupConfigs = [],
    handleGroupChange,
  } = groupState || {};
  const {
    onPrevWeek,
    onResetWeek,
    onNextWeek,
    viewedWeekRange,
    viewedWeekStart,
    isCurrentWeek,
    canGoPrevWeek,
    canGoNextWeek,
  } = weekNavigation || {};
  const { options = [], selection, onChange } = daySelection || {};
  const {
    onPrevDay,
    onResetDay,
    onNextDay,
    currentDayLabel,
    isCurrentDay,
    canGoPrevDay,
    canGoNextDay,
  } = dayNavigation || {};
  const { filtered, computeFiltered } = filtering || {};
  const {
    schedule,
    currentSchedule,
    activeGroupSetId,
    activeGroupSetName,
    groupSetOptions = [],
    onGroupSetChange,
    onCreateGroupSet,
    onRenameActiveGroupSet,
    onDeleteActiveGroupSet,
    onScheduleChange,
  } = scheduleState || {};
  const {
    lektoratOptions = [],
    selectedLectoratSubject,
    onLectoratChange,
    shouldShowLectoratSelect,
  } = lektoratState || {};
  const { exportRef } = exportState || {};

  // whole floating menu visible only on mobile (hidden on sm and larger, and when panel is open)
  return (
    <div className={`${isControlsPanelOpen ? "hidden" : ""} sm:hidden`}>
      {!open && (
        <FloatingBottomNavigation
          viewMode={viewMode}
          setViewMode={setViewMode}
          options={options}
          selection={selection}
          onChange={onChange}
          filtered={filtered}
          onPrevWeek={onPrevWeek}
          onResetWeek={onResetWeek}
          onNextWeek={onNextWeek}
          viewedWeekRange={viewedWeekRange}
          isCurrentWeek={isCurrentWeek}
          canGoPrevWeek={canGoPrevWeek}
          canGoNextWeek={canGoNextWeek}
          onPrevDay={onPrevDay}
          onResetDay={onResetDay}
          onNextDay={onNextDay}
          currentDayLabel={currentDayLabel}
          isCurrentDay={isCurrentDay}
          canGoPrevDay={canGoPrevDay}
          canGoNextDay={canGoNextDay}
          open={open}
          setOpen={setOpen}
        />
      )}

      <FloatingSettingsPanel
        open={open}
        currentSchedule={currentSchedule}
        onScheduleChange={onScheduleChange}
        activeGroupSetId={activeGroupSetId}
        activeGroupSetName={activeGroupSetName}
        groupSetOptions={groupSetOptions}
        onGroupSetChange={onGroupSetChange}
        onCreateGroupSet={onCreateGroupSet}
        onRenameActiveGroupSet={onRenameActiveGroupSet}
        onDeleteActiveGroupSet={onDeleteActiveGroupSet}
        viewMode={viewMode}
        setViewMode={setViewMode}
        hideLectures={hideLectures}
        setHideLectures={setHideLectures}
        showAll={showAll}
        setShowAll={setShowAll}
        groupConfigs={groupConfigs}
        studentGroups={studentGroups}
        handleGroupChange={handleGroupChange}
        shouldShowLectoratSelect={shouldShowLectoratSelect}
        selectedLectoratSubject={selectedLectoratSubject}
        onLectoratChange={onLectoratChange}
        lektoratOptions={lektoratOptions}
        setOpen={setOpen}
        computeFiltered={computeFiltered}
        schedule={schedule}
        viewedWeekStart={viewedWeekStart}
        exportRef={exportRef}
        viewedWeekRange={viewedWeekRange}
        selection={selection}
        options={options}
      />
    </div>
  );
}
