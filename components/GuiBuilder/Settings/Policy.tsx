import { SwitchGroup, TextInput } from "@components/Input";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { memo } from "react";
import InfoTooltip from "../Diagnostics/InfoTooltip";

function Policy() {
  const policy = useStoreState((state) => state.editingPolicy);
  const updatePolicy = useStoreActions((actions) => actions.updatePolicy);

  return (
    <div className="flex flex-col gap-5 text-sm">
      <div className="flex items-center gap-2">
        <div className="flex-none w-1/2 flex items-center gap-1">
          <label htmlFor="attemptLimits" className="">
            Attempt Limits
          </label>
          <AttemptLimitsTooltip />
        </div>
        <TextInput
          id="attemptLimits"
          value={policy.attemptLimits?.toString() ?? ""}
          type="number"
          min="1"
          placeholder="Unlimited"
          onChange={(event) => {
            const value = event.target.value;
            const attemptLimits = value === "" ? null : parseInt(value, 10);
            updatePolicy({ ...policy, attemptLimits });
          }}
          extraClassNames="flex-1 w-10"
        />
      </div>
      <SwitchGroup
        label="Grade immediately after submission"
        checked={policy.gradeImmediately}
        onChange={(value) => {
          updatePolicy({ ...policy, gradeImmediately: value });
        }}
      />
      <SwitchGroup
        label="Reveal grading details"
        description="Show all available grading information right after the submission is graded"
        checked={policy.showImmediateScores}
        onChange={(value) => {
          updatePolicy({ ...policy, showImmediateScores: value });
        }}
      />
    </div>
  );
}

const AttemptLimitsTooltip = memo(() => (
  <InfoTooltip>
    <p>To allow unlimited attempts, set the input box as empty.</p>
  </InfoTooltip>
));
AttemptLimitsTooltip.displayName = "AttemptLimitsTooltip";

export default Policy;
