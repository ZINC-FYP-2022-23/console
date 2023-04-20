import { DateInput, NumberInput, SwitchGroup } from "@/components/Input";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { getDateStringFromLocalDate, getLocalDateFromString } from "@/utils/date";
import { clsx } from "@mantine/core";

/**
 * Grade appeal-related settings.
 */
function GradeAppeal() {
  const gradeAppeal = useStoreState((state) => state.config.editingGradeAppeal);
  const setGradeAppeal = useStoreActions((actions) => actions.config.setGradeAppeal);

  return (
    <div className="p-1 flex flex-col gap-5 text-sm">
      <SwitchGroup
        id="isAppealAllowed"
        checked={gradeAppeal.isAppealAllowed}
        onChange={(value) => setGradeAppeal({ ...gradeAppeal, isAppealAllowed: value })}
        label="Allow grade appeals after releasing grades"
      />
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <label
            htmlFor="appealLimits"
            className={clsx("flex-1 flex items-center gap-1", !gradeAppeal.isAppealAllowed && "text-gray-400")}
          >
            Appeal Limits
          </label>
          <NumberInput
            id="appealLimits"
            value={gradeAppeal.appealLimits ?? 3}
            onChange={(value) => setGradeAppeal({ ...gradeAppeal, appealLimits: value ?? null })}
            min={1}
            placeholder="Unlimited"
            disabled={!gradeAppeal.isAppealAllowed}
            className="flex-[2]"
          />
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="appealStartAt"
            className={clsx("flex-1 text-sm", !gradeAppeal.isAppealAllowed && "text-gray-400")}
          >
            Start Appeal Collection
          </label>
          <div className="flex-[2]">
            <DateInput
              id="appealStartAt"
              selected={getLocalDateFromString(gradeAppeal.appealStartAt)}
              onChange={(date) => {
                setGradeAppeal({
                  ...gradeAppeal,
                  appealStartAt: getDateStringFromLocalDate(date),
                });
              }}
              placeholderText="Start Appeal Collection Date"
              disabled={!gradeAppeal.isAppealAllowed}
              className="!border-solid border border-gray-300 shadow-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="appealStopAt"
            className={clsx("flex-1 text-sm", !gradeAppeal.isAppealAllowed && "text-gray-400")}
          >
            Stop Appeal Collection
          </label>
          <div className="flex-[2]">
            <DateInput
              id="appealStopAt"
              selected={getLocalDateFromString(gradeAppeal.appealStopAt)}
              onChange={(date) => {
                setGradeAppeal({
                  ...gradeAppeal,
                  appealStopAt: getDateStringFromLocalDate(date),
                });
              }}
              placeholderText="Stop Appeal Collection Date"
              disabled={!gradeAppeal.isAppealAllowed}
              className="!border-solid border border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>
      <SwitchGroup
        id="isAppealStudentReplyAllowed"
        checked={gradeAppeal.isAppealStudentReplyAllowed}
        onChange={(value) => setGradeAppeal({ ...gradeAppeal, isAppealStudentReplyAllowed: value })}
        label="Allow students to reply after submitting an appeal"
        disabled={!gradeAppeal.isAppealAllowed}
      />
      <SwitchGroup
        id="isAppealViewReportAllowed"
        checked={gradeAppeal.isAppealViewReportAllowed}
        onChange={(value) => setGradeAppeal({ ...gradeAppeal, isAppealViewReportAllowed: value })}
        label="Allow students to view appeal report"
        disabled={!gradeAppeal.isAppealAllowed}
      />
    </div>
  );
}

export default GradeAppeal;
