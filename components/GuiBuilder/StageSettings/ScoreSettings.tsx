import { NumberInput } from "@components/Input";
import { useSelectedStageConfig } from "@hooks/GuiBuilder";
import { Score } from "@types";

function ScoreSettings() {
  const [config, setConfig] = useSelectedStageConfig<Score>();

  if (!config) return null;

  const isMinGreaterThanMax =
    config.minScore !== undefined && config.maxScore !== undefined && config.minScore > config.maxScore;

  return (
    <div className="p-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="normalizedTo">Normalize maximum score to</label>
          <ul className="mx-5 list-disc text-xs text-gray-500">
            <li>Usually for normalizing score to 100-based</li>
            <li>Leave blank to use the original maximum value</li>
          </ul>
        </div>
        <NumberInput
          id="normalizedTo"
          value={config.normalizedTo}
          onChange={(normalizedTo) => setConfig({ ...config, normalizedTo })}
          min={0}
          placeholder="No normalization"
          className="flex-1"
        />
      </div>
      <div className="mt-6 flex gap-2">
        <div className="flex-1">
          <p>Limit the final score within a range</p>
          <ul className="mx-5 list-disc text-xs text-gray-500">
            <li>Set score to Min if score &lt; Min</li>
            <li>Set score to Max if score &gt; Max</li>
            <li>Leave the input(s) blank to disable clipping</li>
          </ul>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <label htmlFor="minScore" className="w-8 text-gray-500 text-sm">
              Min:
            </label>
            <NumberInput
              id="minScore"
              value={config.minScore}
              onChange={(minScore) => setConfig({ ...config, minScore })}
              placeholder="No minimum limit"
              alertLevel={isMinGreaterThanMax ? "error" : undefined}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="maxScore" className="w-8 text-gray-500 text-sm">
              Max:
            </label>
            <NumberInput
              id="maxScore"
              value={config.maxScore}
              onChange={(maxScore) => setConfig({ ...config, maxScore })}
              placeholder="No minimum limit"
              alertLevel={isMinGreaterThanMax ? "error" : undefined}
              className="flex-1"
            />
          </div>
          {isMinGreaterThanMax && (
            <p className="ml-10 text-sm text-red-500 font-medium">Min value should be smaller than Max value</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScoreSettings;
