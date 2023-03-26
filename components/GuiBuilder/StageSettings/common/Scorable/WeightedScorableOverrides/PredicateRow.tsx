import { NumberInput, Select, SelectItem, TextInput } from "@/components/Input";
import { Override, Predicates } from "@/types/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "@mantine/core";
import { predicateOpOptions, predicateValueBooleanOptions } from "./inputOptions";
import { PredicateData } from "./WeightedScorableOverrides";

interface PredicateRowProps<TPredicates extends Predicates> {
  /** The key of the predicate that this row is setting. */
  predicateKey: string;
  /** The index of this row in the list of predicates. */
  index: number;
  /** Data of what predicate fields the user can add with this component. */
  data: PredicateData<TPredicates>[];
  /**
   * The "override" object containing the data of this row as well as other predicate rows.
   *
   * It expects that the value of this row (i.e. `override[predicateKey]`) is not nullish.
   */
  override: Override<TPredicates>;
  /**
   * An update function that updates the "override" object. You can directly mutate the `override`
   * parameter in the callback function to edit the "override" object.
   */
  updateOverride: (callback: (override: Override<TPredicates>) => void) => void;
}

/**
 * A row that allows user to set a predicate.
 */
function PredicateRow<TPredicates extends Predicates>({
  predicateKey,
  index,
  data,
  override,
  updateOverride,
}: PredicateRowProps<TPredicates>) {
  const predicateKeys = data.map((d) => d.key);

  /** It's expected that the value of this row (i.e. `override[predicateKey]`) is not nullish. */
  const predicateValue = override[predicateKey];
  if (!predicateValue) {
    console.error(`The "override" prop is missing key of "${predicateKey}".`);
    return null;
  }

  const predicateData = data.find((d) => d.key === predicateKey);
  if (!predicateData) {
    console.error(`Cannot find key of "${predicateKey}" in the "data" prop.`);
    return null;
  }

  const numOfPredicatesSet = predicateKeys.reduce((acc, curr) => (override[curr] ? acc + 1 : acc), 0);

  return (
    <div className="flex items-center gap-2" data-cy="predicate-row">
      <span
        className={clsx(
          "font-medium text-cse-500",
          // Show the "AND"/"OR" starting from 2nd row if there are >1 predicates
          numOfPredicatesSet < 2 && "hidden",
          numOfPredicatesSet > 1 && index === 0 && "opacity-0",
        )}
      >
        {override.joinPolicy ?? "AND"}
      </span>
      <Select
        data={data.map((d) => {
          const option: SelectItem<string> = { value: d.key as string, label: d.label };
          // Disallow user from setting multiple predicates for the same target
          if (d.key !== predicateKey && override[d.key]) {
            return { ...option, disabled: true, description: "(This is already set)" };
          }
          return option;
        })}
        value={predicateKey}
        onChange={(newTarget) => {
          if (newTarget === null) return;
          updateOverride((override) => {
            // @ts-ignore
            override[newTarget] = override[predicateKey];
            if (predicateKey !== newTarget) {
              delete override[predicateKey];
            }
          });
        }}
        data-cy="predicate-row-key"
      />
      <Select
        data={predicateOpOptions[predicateData.type]}
        value={predicateValue.op}
        onChange={(op) => {
          if (op === null) return;
          // @ts-ignore
          updateOverride((override) => (override[predicateKey] = { ...predicateValue, op }));
        }}
        maxDropdownHeight={250}
        data-cy="predicate-row-op"
      />
      {predicateData.type === "string" && (
        <TextInput
          value={predicateValue.value as string}
          onChange={(e) => {
            updateOverride((override) => {
              // @ts-ignore
              override[predicateKey] = { ...predicateValue, value: e.target.value };
            });
          }}
          classNames={{ root: "flex-1", input: "font-mono" }}
          data-cy="predicate-row-value-string"
        />
      )}
      {predicateData.type === "number" && (
        <NumberInput
          value={predicateValue.value as number}
          onChange={(value) => {
            if (value === undefined) return;
            updateOverride((override) => {
              // @ts-ignore
              override[predicateKey] = { ...predicateValue, value };
            });
          }}
          className="flex-1"
          data-cy="predicate-row-value-number"
        />
      )}
      {predicateData.type === "boolean" && (
        <Select
          data={predicateValueBooleanOptions}
          value={(predicateValue.value as boolean).toString()}
          onChange={(value) => {
            if (value === null) return;
            updateOverride((override) => {
              // @ts-ignore
              override[predicateKey] = { ...predicateValue, value: value === "true" };
            });
          }}
          styles={{ root: { flex: 1 } }}
          data-cy="predicate-row-value-boolean"
        />
      )}
      {/** User should not be able to delete all predicates because the grader will output error
       * if no predicates are defined. See https://docs.zinc.ust.dev/user/pipeline/docker/XUnit.html#weighted-scorable
       */}
      {numOfPredicatesSet > 1 && (
        <button
          title="Delete condition"
          onClick={() => updateOverride((override) => delete override[predicateKey])}
          className="w-8 h-8 flex items-center justify-center text-xl text-red-500 rounded-full hover:bg-red-100 active:bg-red-200 transition"
        >
          <FontAwesomeIcon icon={["fas", "xmark"]} />
        </button>
      )}
    </div>
  );
}

export default PredicateRow;
