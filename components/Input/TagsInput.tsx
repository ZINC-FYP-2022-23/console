import { TagsInput as ReactTagInput, TagsInputProps as ReactTagInputProps } from "react-tag-input-component";

interface TagsInputPropsOld extends ReactTagInputProps {
  /** Extra classes to style the wrapper. */
  className?: string;
}

/**
 * A component for tag(s) input.
 */
function TagsInput({ className = "", ...props }: TagsInputPropsOld) {
  return (
    // Custom styles are put in `index.css`
    <div className={`tag-input ${className}`}>
      <ReactTagInput {...props} />
    </div>
  );
}

export default TagsInput;
