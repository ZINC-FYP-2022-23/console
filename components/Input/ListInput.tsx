import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createContext, useContext, useRef, KeyboardEvent, useState, useEffect } from "react";

//////////////////// Context ////////////////////

interface ListInputContextType {
  /**
   * Array of refs to each input element.
   */
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  /**
   * Index of the input element that should be focused. It's `null` when no input element shall be focused.
   */
  inputIndexToFocus: number | null;
  setInputIndexToFocus: React.Dispatch<React.SetStateAction<number | null>>;
}

const ListInputContext = createContext<ListInputContextType | null>(null);
ListInputContext.displayName = "ListInputContext";

function useListInputContext() {
  const context = useContext(ListInputContext);
  if (context === null) {
    const error = new Error("useListInputContext must be inside a <ListInput /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(error, useListInputContext);
    throw error;
  }
  return context;
}

//////////////////// Components ////////////////////

interface ListInputRootProps {
  children: React.ReactNode;
}

const ListInputRoot = ({ children }: ListInputRootProps) => {
  const inputRefs = useRef<ListInputContextType["inputRefs"]["current"]>([]);
  const [inputIndexToFocus, setInputIndexToFocus] = useState<number | null>(null);

  // Auto-focus the (`inputIndexToFocus`)th input box
  useEffect(() => {
    if (inputIndexToFocus !== null) {
      inputRefs.current[inputIndexToFocus]?.focus();
      setInputIndexToFocus(null);
    }
  }, [inputIndexToFocus]);

  return (
    <div className="flex flex-col gap-2">
      <ListInputContext.Provider value={{ inputRefs, inputIndexToFocus, setInputIndexToFocus }}>
        {children}
      </ListInputContext.Provider>
    </div>
  );
};
ListInputRoot.displayName = "ListInput";

interface ItemProps extends React.ComponentPropsWithRef<"input"> {
  /**
   * Index of this item in the list.
   */
  index: number;
  /**
   * Event handler for pressing the "Enter" key in the input box. It should update the state to insert
   * a new list item.
   */
  onEnterKeyPressed: () => void;
  /**
   * Event handler for deleting the this list item.
   */
  onDelete: () => void;
}

const Item = ({ index, onEnterKeyPressed, onDelete, ...inputProps }: ItemProps) => {
  const { inputRefs, setInputIndexToFocus } = useListInputContext();

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    switch (event.key) {
      // Move focus to previous input box
      case "ArrowUp":
        event.preventDefault();
        setInputIndexToFocus(index - 1);
        break;
      // Move focus to next input box
      case "ArrowDown":
        event.preventDefault();
        setInputIndexToFocus(index + 1);
        break;
      // Insert new input box below
      case "Enter":
        onEnterKeyPressed();
        setInputIndexToFocus(index + 1);
        break;
      // Auto-delete an empty input box
      case "Backspace":
      case "Delete":
        if (inputRefs.current[index]?.value === "") {
          onDelete();
          setInputIndexToFocus(index === 0 ? 0 : index - 1);
        }
        break;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={(ref) => (inputRefs.current[index] = ref)}
        type="text"
        onKeyDown={(event) => handleInputKeyDown(event, index)}
        className="flex-1 py-1 border-0 border-b-2 border-gray-200 font-mono text-sm leading-6 placeholder:text-gray-400 focus:ring-0 focus:border-blue-400 transition"
        {...inputProps}
      />
      <button
        onClick={onDelete}
        className="w-8 h-8 flex items-center justify-center text-xl text-red-500 rounded-full hover:bg-red-100 active:bg-red-200 transition"
      >
        <FontAwesomeIcon icon={["fas", "xmark"]} />
      </button>
    </div>
  );
};
Item.displayName = "ListInput.Item";

interface AddButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  /**
   * Event handler of clicking the add button. It should update the state to push a new element.
   */
  onClick: () => void;
}

const AddButton = ({ onClick, ...props }: AddButtonProps) => {
  const { inputRefs } = useListInputContext();
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    // We focus the element here instead of in the button's `onClick` handler because `inputRefs` is not
    // yet updated if we do it in `onClick`.
    if (isClicked) {
      const newlyInsertedInput = inputRefs.current.reduceRight((acc, curr) => acc ?? curr, null);
      newlyInsertedInput?.focus();
      setIsClicked(false);
    }
  }, [isClicked, inputRefs]);

  return (
    <button
      onClick={() => {
        onClick();
        setIsClicked(true);
      }}
      className="w-7 h-7 mt-1 ml-2 flex items-center justify-center bg-green-500 text-base text-white rounded-full hover:bg-green-600 active:bg-green-700 transition"
      {...props}
    >
      <FontAwesomeIcon icon={["fas", "add"]} />
    </button>
  );
};

/**
 * A list input element with keyboard support.
 */
const ListInput = Object.assign(ListInputRoot, { Item, AddButton });

export default ListInput;