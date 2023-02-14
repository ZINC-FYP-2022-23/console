import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx, createStyles, Select as MantineSelect, SelectProps as MantineSelectProps } from "@mantine/core";
import { forwardRef } from "react";
import { getInputBoxWrapperStyles } from "./mantineStyles";

/**
 * Data of an item in the {@link Select} component. The `TValue` type parameter
 * is the type of the item's value.
 *
 * It's similar to Mantine's `SelectItem` type but with generics support.
 */
export interface SelectItem<TValue extends string = string> {
  value: TValue;
  /** Label to show in the UI. */
  label: string;
  /** Description of the item. */
  description?: string;
  disabled?: boolean;
  group?: string;
  [key: string]: any;
}

/**
 * Props for Mantine's `Select` component with generics support.
 */
interface SelectProps<TValue extends string> extends Omit<MantineSelectProps, "data" | "value" | "onChange"> {
  /** Data for each select option. */
  data: SelectItem<TValue>[];
  /** The selected value. */
  value: TValue;
  /** Callback when a new option is selected. */
  onChange: (value: TValue | null) => void;
}

const useStyles = createStyles((theme) => ({
  wrapper: getInputBoxWrapperStyles(theme),
  item: {
    "&[data-selected]": {
      backgroundColor: "#dbeafe",
      color: "#1d4ed8",
      fontWeight: 500,
      "&:hover": {
        backgroundColor: "#dbeafe",
      },
    },
  },
  rightSection: {
    pointerEvents: "none",
  },
}));

const rightChevron = <FontAwesomeIcon icon={["fas", "chevron-down"]} className="text-sm text-gray-400" />;

/**
 * A component for selecting a value from a list of options.
 *
 * Each select item can have an optional description.
 */
function Select<TValue extends string>({ data, value, onChange, ...props }: SelectProps<TValue>) {
  const { classes } = useStyles();
  return (
    <MantineSelect
      data={data}
      value={value}
      onChange={onChange}
      itemComponent={SelectItem}
      rightSection={rightChevron}
      classNames={classes}
      {...props}
    />
  );
}

interface SelectItemProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  description?: string;
  disabled?: boolean;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(({ label, description, disabled, ...props }, ref) => (
  <div ref={ref} {...props}>
    <p>{label}</p>
    {description && (
      <p className={clsx("text-xs font-normal", disabled === true ? "text-gray-400" : "text-gray-500")}>
        {description}
      </p>
    )}
  </div>
));
SelectItem.displayName = "SelectItem";

export default Select;
