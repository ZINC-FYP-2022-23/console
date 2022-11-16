import { DateInput } from "@components/Input";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { appendZToIsoString } from "@utils/Config";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

const getLocalDateFromString = (date: string) => {
  return date ? utcToZonedTime(appendZToIsoString(date), "Asia/Hong_Kong") : null;
};

const getDateStringFromLocalDate = (date: Date | null) => {
  if (date) {
    return zonedTimeToUtc(date, "Asia/Hong_Kong").toISOString();
  }
  return "";
};

function Scheduling() {
  const schedule = useStoreState((state) => state.editingSchedule);
  const policy = useStoreState((state) => state.editingPolicy);
  const updateSchedule = useStoreActions((state) => state.updateSchedule);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="showAt" className="text-sm font-medium leading-5 text-gray-900">
          Announce
        </label>
        <div className="rounded-md shadow-sm">
          <DateInput
            id="showAt"
            selected={getLocalDateFromString(schedule.showAt)}
            onChange={(date) => {
              updateSchedule({
                ...schedule,
                showAt: getDateStringFromLocalDate(date),
              });
            }}
            placeholderText="Assignment Announcement Date"
          />
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <label htmlFor="startCollectionAt" className="text-sm font-medium leading-5 text-gray-900">
          Start Collection
        </label>
        <div className="rounded-md shadow-sm">
          <DateInput
            id="startCollectionAt"
            selected={getLocalDateFromString(schedule.startCollectionAt)}
            maxDate={getLocalDateFromString(schedule.dueAt)}
            onChange={(date) => {
              updateSchedule({
                ...schedule,
                startCollectionAt: getDateStringFromLocalDate(date),
              });
            }}
            placeholderText="Assignment Collection Start Date"
          />
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <label htmlFor="dueAt" className="text-sm font-medium leading-5 text-gray-900">
          Due
        </label>
        <div className="rounded-md shadow-sm">
          <DateInput
            id="dueAt"
            selected={getLocalDateFromString(schedule.dueAt)}
            minDate={getLocalDateFromString(schedule.startCollectionAt)}
            onChange={(date) => {
              if (!date) return; // `dueAt` is non-nullable in database
              if (date > getLocalDateFromString(schedule.stopCollectionAt)!) {
                updateSchedule({
                  ...schedule,
                  dueAt: getDateStringFromLocalDate(date),
                  stopCollectionAt: getDateStringFromLocalDate(date),
                });
              } else {
                updateSchedule({
                  ...schedule,
                  dueAt: getDateStringFromLocalDate(date),
                });
              }
            }}
            placeholderText="Assignment Grades Release Date"
          />
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <label htmlFor="stopCollectionAt" className="text-sm font-medium leading-5 text-gray-900">
          Stop Collection
        </label>
        <div className="rounded-md shadow-sm">
          <DateInput
            id="stopCollectionAt"
            selected={getLocalDateFromString(schedule.stopCollectionAt)}
            minDate={getLocalDateFromString(schedule.dueAt)}
            onChange={(date) => {
              if (!date) return; // `stopCollectionAt` is non-nullable in database
              updateSchedule({
                ...schedule,
                stopCollectionAt: getDateStringFromLocalDate(date),
              });
            }}
            placeholderText="Assignment Collection Closing Date"
          />
        </div>
      </div>
      {!policy.showImmediateScores && (
        <div className="flex flex-col space-y-2">
          <label htmlFor="releaseGradeAt" className="text-sm font-medium leading-5 text-gray-900">
            Release Grade
          </label>
          <div className="rounded-md shadow-sm">
            <DateInput
              id="releaseGradeAt"
              selected={getLocalDateFromString(schedule.releaseGradeAt)}
              onChange={(date) => {
                updateSchedule({
                  ...schedule,
                  releaseGradeAt: getDateStringFromLocalDate(date),
                });
              }}
              placeholderText="Assignment Grades Release Date"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Scheduling;