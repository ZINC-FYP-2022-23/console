import { NumberInput, Select } from "@/components/Input";
import { DenormalPolicy } from "@/types/GuiBuilder";
import InfoAccordion from "../InfoAccordion";
import { denormalPolicySelectOptions } from "./inputOptions";

interface TotalScorableSettingsProps {
  score: number;
  onChangeScore: (score: number | undefined) => void;
  treatDenormalScore: DenormalPolicy;
  onChangeTreatDenormalScore: (policy: DenormalPolicy | null) => void;
}

/**
 * Input components for {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#total-based-scorable Total-Based Scorable}
 * fields.
 */
function TotalScorableSettings({
  score,
  onChangeScore,
  treatDenormalScore,
  onChangeTreatDenormalScore,
}: TotalScorableSettingsProps) {
  return (
    <>
      <div className="pb-12 border-b border-gray-300 space-y-4">
        <div className="flex gap-3">
          <div className="mt-2 flex-1">
            <label htmlFor="score">
              Total score for passing all tests <span className="text-red-600 text-xs">(required)</span>
            </label>
            <p className="text-gray-500 text-xs">
              Score is computed by multiplying percentage of test cases passed with this value
            </p>
          </div>
          <NumberInput
            id="score"
            value={score}
            onChange={onChangeScore}
            min={0}
            placeholder="e.g. 100"
            className="flex-1"
          />
        </div>
        <div className="flex gap-3">
          <div className="mt-2 flex-1">
            <label htmlFor="treatDenormalScore">Treatment of invalid scores</label>
            <p className="text-gray-500 text-xs">
              The computed score can be invalid (i.e. <code>NaN</code>) when 0 test cases are executed
            </p>
          </div>
          <Select
            id="treatDenormalScore"
            data={denormalPolicySelectOptions}
            value={treatDenormalScore}
            onChange={onChangeTreatDenormalScore}
            styles={{ root: { flex: 1 } }}
          />
        </div>
      </div>
      <InfoAccordion title="Examples">
        <div className="space-y-3 leading-6">
          <div>
            <p className="font-semibold">Example 1:</p>
            <ul className="px-5 text-sm list-disc">
              <li>The test suite has 40 cases and the student passes 25/40 cases</li>
              <li>&quot;Total score for passing all tests&quot; is set to 100</li>
            </ul>
            <p>
              The student scores <code>25/40 * 100 = 62.5</code> out of 100
            </p>
          </div>
          <div>
            <p className="font-semibold">Example 2:</p>
            <ul className="px-5 text-sm list-disc">
              <li>
                The test suite has 40 <span className="font-semibold">disabled</span> cases and the student passes 0/0
                cases
              </li>
              <li>&quot;Total score for passing all tests&quot; is set to 100</li>
              <li>
                &quot;Treatment of invalid scores&quot; is set to &quot;
                {denormalPolicySelectOptions.find((o) => o.value === "FAILURE")!.label}&quot;
              </li>
            </ul>
            <p>The student scores 0 out of 100 due to the treatment of invalid scores</p>
          </div>
        </div>
      </InfoAccordion>
    </>
  );
}

export default TotalScorableSettings;
