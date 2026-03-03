import { FloatingBottomNavigation } from "./FloatingBottomNavigation";
import { FloatingSettingsPanel } from "./FloatingSettingsPanel";

export default function FloatingMenu({
  viewMode,
  setViewMode,
  hideLectures,
  setHideLectures,
  showAll,
  setShowAll,
  studentGroups,
  groupConfigs = [],
  handleGroupChange,
  filtered,
  open,
  setOpen,
  options = [],
  selection,
  onChange,
  onPrevWeek,
  onResetWeek,
  onNextWeek,
  viewedWeekRange,
  viewedWeekStart,
  isCurrentWeek,
  canGoPrevWeek,
  canGoNextWeek,
  currentParity,
  currentRange,
  ref,
  computeFiltered,
  SCHEDULE,
  currentSchedule,
  activeGroupSetId,
  activeGroupSetName,
  groupSetOptions = [],
  onGroupSetChange,
  onSaveGroupSet,
  onCreateGroupSet,
  onUpdateActiveGroupSet,
  onRenameActiveGroupSet,
  onDeleteActiveGroupSet,
  lektoratOptions = [],
  selectedLectoratSubject,
  onLectoratChange,
  shouldShowLectoratSelect,
  onScheduleChange,
  allTimetables = [],
  isControlsPanelOpen = false,
}) {
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
          open={open}
          setOpen={setOpen}
        />
      )}

      <FloatingSettingsPanel
        open={open}
        currentSchedule={currentSchedule}
        onScheduleChange={onScheduleChange}
        allTimetables={allTimetables}
        activeGroupSetId={activeGroupSetId}
        activeGroupSetName={activeGroupSetName}
        groupSetOptions={groupSetOptions}
        onGroupSetChange={onGroupSetChange}
        onSaveGroupSet={onSaveGroupSet}
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
        SCHEDULE={SCHEDULE}
        viewedWeekStart={viewedWeekStart}
        ref={ref}
        viewedWeekRange={viewedWeekRange}
        selection={selection}
        options={options}
      />
    </div>
  );
}
