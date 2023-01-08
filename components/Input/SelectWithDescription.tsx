import { createStyles, Select, SelectProps } from "@mantine/core";
import { forwardRef } from "react";
import { getInputBoxWrapperStyles } from "./mantineStyles";

const useStyles = createStyles((theme) => ({
  wrapper: {
    // A trick to increase specificity of styles so they don't get overridden by Tailwind default styles
    "& input": getInputBoxWrapperStyles(theme),
  },
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
}));

/**
 * Mantine's `SelectItem` type but with generics support.
 */
export interface SelectItem<TValue extends string> {
  value: TValue;
  label?: string;
  disabled?: boolean;
  group?: string;
  [key: string]: any;
}

interface SelectWithDescriptionProps<TValue extends string> extends Omit<SelectProps, "data" | "value" | "onChange"> {
  /** Data for each select option. */
  data: SelectItem<TValue>[];
  /** The selected value. */
  value: TValue;
  /** Callback when a new option is selected. */
  onChange: (value: TValue | null) => void;
}

/**
 * A select input with a description for each option.
 */
function SelectWithDescription<TValue extends string>({
  data,
  value,
  onChange,
  ...props
}: SelectWithDescriptionProps<TValue>) {
  const { classes } = useStyles();
  return (
    // TODO(Anson): Change the icon to use `MultiSelect`'s icon.
    <Select data={data} value={value} onChange={onChange} itemComponent={SelectItem} classNames={classes} {...props} />
  );
}

interface SelectItemProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  description?: string;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(({ label, description, ...props }, ref) => (
  <div ref={ref} {...props}>
    <p>{label}</p>
    {description && <p className="text-xs text-gray-500 font-normal">{description}</p>}
  </div>
));
SelectItem.displayName = "VisibilitySelectItem";

export default SelectWithDescription;
