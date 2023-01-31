import Button from "@/components/Button";
import { NumberInput, Select } from "@/components/Input";
import { defaultXUnitOverride } from "@/constants/GuiBuilder/defaults";
import { Override, Predicate, Predicates, PredicateSupportedValueTypes } from "@/types/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cloneDeep from "lodash/cloneDeep";
import { joinPolicyOptions } from "./inputOptions";
import PredicateRow from "./PredicateRow";

/** Data of a single predicate field the user can add. */
export type PredicateData<TPredicates extends Predicates> = {
  /** The field name of the predicate. */
  key: keyof TPredicates;
  /** Label for the field name of the predicate. */
  label: string;
  /**
   * Type of the {@link Predicate.value predicate's value}.
   *
   * It determines which input element to use for the value (e.g. `"number"` will show a number input).
   */
  type: PredicateSupportedValueTypes;
};

interface WeightedScorableOverridesProps<TPredicates extends Predicates> {
  /** Data of what predicate fields the user can add with this component. */
  data: PredicateData<TPredicates>[];
  /** Actual value of every overrides. */
  overrides: Override<TPredicates>[];
  /** Callback when the overrides are updated in this component. */
  setOverrides: (overrides: Override<TPredicates>[]) => void;
  /** Callback when te user presses the "Add Override" button. */
  onAddOverride: () => void;
}

/**
 * Input element to specify {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#override overrides}
 * in {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#weighted-scorable Weighted Scorable}.
 */
function WeightedScorableOverrides<TPredicates extends Predicates>({
  data,
  overrides,
  setOverrides,
  onAddOverride,
}: WeightedScorableOverridesProps<TPredicates>) {
  /**
   * Updates an score override element.
   * @param index Index of the element in the `overrides` array.
   * @param callback A callback where you can directly mutate the `override` parameter to update it.
   */
  const updateOverride = (index: number, callback: (override: Override<TPredicates>) => void) => {
    const override = cloneDeep(overrides[index]);
    callback(override);
    setOverrides([...overrides.slice(0, index), override, ...overrides.slice(index + 1)]);
  };

  const predicateKeys = data.map((d) => d.key);

  return (
    <div className="space-y-4">
      {overrides.map((override, index) => {
        /** The `override` object but only contains predicate-related fields that have non-nullish values. */
        const overrideWithPredicatesOnly: TPredicates = (() => {
          const output = {} as TPredicates;
          predicateKeys.forEach((key) => {
            if (override[key]) {
              output[key] = override[key];
            }
          });
          return output;
        })();

        const numOfPredicatesSet = predicateKeys.reduce((acc, curr) => (override[curr] ? acc + 1 : acc), 0);

        return (
          <div key={override._uuid} className="px-4 py-3 bg-gray-100 rounded-md text-sm">
            <div className="flex items-center gap-3 text-gray-700">
              <span>Set score to</span>
              <NumberInput
                value={override.score}
                onChange={(value) => {
                  if (value === undefined) return;
                  updateOverride(index, (override) => (override.score = value));
                }}
                styles={{ input: { width: "6rem" } }}
              />
              <span>for test cases matching</span>
              <Select
                data={joinPolicyOptions}
                value={override.joinPolicy ?? defaultXUnitOverride.joinPolicy}
                onChange={(value) => {
                  if (value === null) return;
                  updateOverride(index, (override) => (override.joinPolicy = value));
                }}
                styles={{ input: { width: "5rem" } }}
              />
              <span>conditions of:</span>
              <button
                title="Delete score override"
                onClick={() => {
                  setOverrides(overrides.filter((o) => o._uuid !== override._uuid));
                }}
                className="w-8 h-8 ml-auto flex justify-center items-center text-white text-base bg-red-500 drop-shadow rounded-full transition hover:bg-red-700"
              >
                <FontAwesomeIcon icon={["far", "trash-can"]} />
              </button>
            </div>
            <div className="mt-4 mb-3 space-y-2">
              {Object.keys(overrideWithPredicatesOnly).map((key, keysIndex) => (
                <PredicateRow
                  key={key}
                  predicateKey={key}
                  data={data}
                  override={override}
                  updateOverride={(callback: (override: Override<TPredicates>) => void) =>
                    updateOverride(index, callback)
                  }
                  index={keysIndex}
                />
              ))}
            </div>
            {numOfPredicatesSet < predicateKeys.length && (
              <Button
                onClick={() => {
                  updateOverride(index, (override) => {
                    // Grader will emit error if no join policy is set when there are >1 predicates
                    if (!override.joinPolicy) {
                      override.joinPolicy = defaultXUnitOverride.joinPolicy;
                    }
                    // Set a predicate that is not set yet
                    for (const key of predicateKeys) {
                      if (!override[key]) {
                        const predicateData = data.find((d) => d.key === key);
                        const dataType = predicateData?.type ?? "string";
                        // @ts-ignore
                        override[key] = {
                          op: "EQ", // "EQ" is chosen since it's found in all types of predicate operations
                          value: (() => {
                            switch (dataType) {
                              case "string":
                                return "";
                              case "boolean":
                                return false;
                              case "number":
                                return 0;
                            }
                          })(),
                        };
                        return;
                      }
                    }
                  });
                }}
                icon={<FontAwesomeIcon icon={["far", "plus"]} />}
                className="border border-cse-500 text-cse-500 hover:bg-blue-50 active:bg-blue-100"
              >
                Add condition
              </Button>
            )}
          </div>
        );
      })}
      <Button
        onClick={onAddOverride}
        icon={<FontAwesomeIcon icon={["far", "plus"]} />}
        className="bg-cse-500 text-white hover:bg-cse-600 active:bg-cse-700"
      >
        Add Override
      </Button>
    </div>
  );
}

export default WeightedScorableOverrides;
