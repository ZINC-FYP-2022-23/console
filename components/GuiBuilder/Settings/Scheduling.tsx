import { DateInput } from "@/components/Input";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { appendZToIsoString } from "@/utils/GuiBuilder";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

const getLocalDateFromString = (date: string | null) => {
  return date ? utcToZonedTime(appendZToIsoString(date), "Asia/Hong_Kong") : null;
};

const getDateStringFromLocalDate = (date: Date | null) => {
  return date ? zonedTimeToUtc(date, "Asia/Hong_Kong").toISOString() : null;
};

function Scheduling() {
  const schedule = useStoreState((state) => state.config.editingSchedule);
  const policy = useStoreState((state) => state.config.editingPolicy);
  const setSchedule = useStoreActions((state) => state.config.setSchedule);

  return (
    <div className="p-1 space-y-3">
      <div className="flex items-center gap-3">
        <label htmlFor="showAt" className="flex-1 text-sm">
          Announce
        </label>
        <div className="flex-[2]">
          <DateInput
            id="showAt"
            selected={getLocalDateFromString(schedule.showAt)}
            onChange={(date) => {
              setSchedule({
                ...schedule,
                showAt: getDateStringFromLocalDate(date),
              });
            }}
            placeholderText="Assignment Announcement Date"
            className="!border-solid border border-gray-300 shadow-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor="startCollectionAt" className="flex-1 text-sm">
          Start Collection
        </label>
        <div className="flex-[2]">
          <DateInput
            id="startCollectionAt"
            selected={getLocalDateFromString(schedule.startCollectionAt)}
            maxDate={getLocalDateFromString(schedule.dueAt)}
            onChange={(date) => {
              setSchedule({
                ...schedule,
                startCollectionAt: getDateStringFromLocalDate(date),
              });
            }}
            placeholderText="Assignment Collection Start Date"
            className="!border-solid border border-gray-300 shadow-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor="dueAt" className="flex-1 text-sm">
          Due
        </label>
        <div className="flex-[2]">
          <DateInput
            id="dueAt"
            selected={getLocalDateFromString(schedule.dueAt)}
            minDate={getLocalDateFromString(schedule.startCollectionAt)}
            onChange={(date) => {
              if (!date) return; // `dueAt` is non-nullable in database
              if (date > getLocalDateFromString(schedule.stopCollectionAt)!) {
                setSchedule({
                  ...schedule,
                  dueAt: getDateStringFromLocalDate(date)!,
                  stopCollectionAt: getDateStringFromLocalDate(date)!,
                });
              } else {
                setSchedule({
                  ...schedule,
                  dueAt: getDateStringFromLocalDate(date)!,
                });
              }
            }}
            placeholderText="Assignment Grades Release Date"
            className="!border-solid border border-gray-300 shadow-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor="stopCollectionAt" className="flex-1 text-sm">
          Stop Collection
        </label>
        <div className="flex-[2]">
          <DateInput
            id="stopCollectionAt"
            selected={getLocalDateFromString(schedule.stopCollectionAt)}
            minDate={getLocalDateFromString(schedule.dueAt)}
            onChange={(date) => {
              if (!date) return; // `stopCollectionAt` is non-nullable in database
              setSchedule({
                ...schedule,
                stopCollectionAt: getDateStringFromLocalDate(date)!,
              });
            }}
            placeholderText="Assignment Collection Closing Date"
            className="!border-solid border border-gray-300 shadow-sm"
          />
        </div>
      </div>
      {!policy.showImmediateScores && (
        <div className="flex items-center gap-3">
          <label htmlFor="releaseGradeAt" className="flex-1 text-sm">
            Release Grade
          </label>
          <div className="flex-[2]">
            <DateInput
              id="releaseGradeAt"
              selected={getLocalDateFromString(schedule.releaseGradeAt)}
              onChange={(date) => {
                setSchedule({
                  ...schedule,
                  releaseGradeAt: getDateStringFromLocalDate(date),
                });
              }}
              placeholderText="Assignment Grades Release Date"
              className="!border-solid border border-gray-300 shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Scheduling;
