import { clsx } from "@mantine/core";
import { TagsInput as ReactTagInput, TagsInputProps as ReactTagInputProps } from "react-tag-input-component";

interface TagsInputProps extends Omit<ReactTagInputProps, "value"> {
  /** Initial tags. */
  value: string[];
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Extra classes to style the wrapper. */
  className?: string;
  /** HTML id attribute to put at the wrapper. */
  id?: string;
}

/**
 * A component for tag(s) input.
 */
function TagsInput({ value, disabled = false, className = "", id, ...props }: TagsInputProps) {
  return (
    // Custom styles are put in `index.css`
    <div id={id} className={clsx("tag-input", disabled && "disabled", className)}>
      <ReactTagInput value={value} disabled={disabled} separators={[" ", ","]} isEditOnRemove {...props} />
    </div>
  );
}

export default TagsInput;
