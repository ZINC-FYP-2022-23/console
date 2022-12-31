import { clsx } from "@mantine/core";
import { TagsInput as ReactTagInput, TagsInputProps as ReactTagInputProps } from "react-tag-input-component";

interface TagsInputProps extends Omit<ReactTagInputProps, "value"> {
  /** Initial tags. */
  value: string[];
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Extra classes to style the wrapper. */
  className?: string;
}

/**
 * A component for tag(s) input.
 */
function TagsInput({ value, disabled = false, className = "", ...props }: TagsInputProps) {
  return (
    // Custom styles are put in `index.css`
    <div className={clsx("tag-input", disabled && "disabled", className)}>
      <ReactTagInput value={value} disabled={disabled} {...props} />
    </div>
  );
}

export default TagsInput;
