import { ScorablePolicy } from "@/types/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RadioGroup } from "@headlessui/react";
import { clsx } from "@mantine/core";

/** An option for the {@link ScorablePolicyRadioGroup}. */
export type ScorablePolicyRadioGroupOption<TPolicy extends ScorablePolicy> = Readonly<{
  value: TPolicy;
  label: string;
  description: string;
}>;

export interface ScorablePolicyRadioGroupProps<TPolicy extends ScorablePolicy> {
  /** Scoring policy options to show (i.e. the policies supported by the stage). */
  options: ScorablePolicyRadioGroupOption<TPolicy>[];
  /** The current selected value. */
  value: TPolicy;
  /** Callback when the radio group value is updated. */
  onChange: (value: TPolicy) => void;
}

/**
 * A radio button card group for selecting the scoring policy of a
 * {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html Scorable} stage.
 */
function ScorablePolicyRadioGroup<TPolicy extends ScorablePolicy>({
  options,
  value,
  onChange,
}: ScorablePolicyRadioGroupProps<TPolicy>) {
  if (options.findIndex((option) => option.value === value) === -1) {
    console.error(`The value '${value}' is not found in any of the options.`);
  }

  return (
    <RadioGroup value={value} onChange={onChange} className="w-full flex gap-4">
      {options.map((option) => (
        <RadioGroup.Option
          key={option.value}
          value={option.value}
          className={({ checked }) =>
            clsx(
              "p-3 flex-1 bg-white border cursor-pointer rounded-md",
              checked ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300",
            )
          }
        >
          {({ checked }) => (
            <>
              <div className="mb-2 flex items-center justify-between">
                <RadioGroup.Label className={clsx("font-medium text-base", checked && "text-blue-600")}>
                  {option.label}
                </RadioGroup.Label>
                {checked ? (
                  <div className="w-5 h-5 flex items-center justify-center bg-blue-500 rounded-full text-white">
                    <FontAwesomeIcon icon={["fas", "check"]} className="text-sm" />
                  </div>
                ) : (
                  <div className="w-5 h-5 border border-gray-300 rounded-full" />
                )}
              </div>
              <RadioGroup.Description className="text-gray-500 text-xs">{option.description}</RadioGroup.Description>
            </>
          )}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
}

export default ScorablePolicyRadioGroup;
