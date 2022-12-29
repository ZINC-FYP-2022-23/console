import { TagsInput as ReactTagInput, TagsInputProps as ReactTagInputProps } from "react-tag-input-component";

interface TagsInputProps extends Omit<ReactTagInputProps, "value"> {
  /** Initial tags. */
  value: string[];
  /** Extra classes to style the wrapper. */
  className?: string;
}

/**
 * A component for tag(s) input.
 */
function TagsInput({ value, className = "", ...props }: TagsInputProps) {
  return (
    // Custom styles are put in `index.css`
    <div className={`tag-input ${className}`}>
      <ReactTagInput value={value} {...props} />
    </div>
  );
}

export default TagsInput;
