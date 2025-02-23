import { SwitchGroup } from "@/components/Input";
import NumberInput from "@/components/Input/NumberInput";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { memo } from "react";
import { InfoTooltip } from "../Diagnostics";

function Policy() {
  const policy = useStoreState((state) => state.config.editingPolicy);
  const setPolicy = useStoreActions((actions) => actions.config.setPolicy);

  return (
    <div className="px-1 pt-1 flex flex-col gap-5 text-sm">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1">
          <label htmlFor="attemptLimits">Attempt Limits</label>
          <AttemptLimitsTooltip />
        </div>
        <NumberInput
          id="attemptLimits"
          value={policy.attemptLimits ?? undefined}
          onChange={(value) => setPolicy({ ...policy, attemptLimits: value ?? null })}
          min={1}
          placeholder="Unlimited"
          className="flex-[2]"
        />
      </div>
      <SwitchGroup
        id="gradeImmediately"
        label="Grade immediately after submission"
        checked={policy.gradeImmediately}
        onChange={(value) => {
          setPolicy({ ...policy, gradeImmediately: value });
        }}
      />
      <SwitchGroup
        id="showImmediateScores"
        label="Show all available grading details after grading the submission"
        checked={policy.showImmediateScores}
        onChange={(value) => {
          setPolicy({ ...policy, showImmediateScores: value });
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
