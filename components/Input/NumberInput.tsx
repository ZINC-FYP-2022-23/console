import {
  clsx,
  createStyles,
  NumberInput as MantineNumberInput,
  NumberInputProps as MantineNumberInputProps,
} from "@mantine/core";
import { getInputBoxWrapperStyles } from "./mantineStyles";

interface NumberInputProps extends MantineNumberInputProps {
  /**
   * Alert stylings to apply.
   */
  alertLevel?: "error" | "warning";
  /**
   * Alert message below the input.
   */
  alertText?: React.ReactNode;
  /**
   * Classes to apply extra styling to the wrapper.
   */
  className?: string;
}

const useStyles = createStyles((theme) => ({
  wrapper: getInputBoxWrapperStyles(theme, true),
}));

/**
 * An input element for numbers.
 */
function NumberInput({ alertLevel, alertText, className = "", ...props }: NumberInputProps) {
  const { classes } = useStyles();
  return (
    <div className={clsx("flex flex-col", className)}>
      <MantineNumberInput data-alert-level={alertLevel} classNames={classes} {...props} />
      {alertText && (
        <div
          className={clsx(
            "mt-1 text-xs",
            alertLevel === "error" && "text-red-500",
            alertLevel === "warning" && "text-orange-500",
          )}
        >
          {alertText}
        </div>
      )}
    </div>
  );
}

export default NumberInput;
