import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "@mantine/core";
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
  id?: string;
}

const ListInputRoot = ({ children, id }: ListInputRootProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [inputIndexToFocus, setInputIndexToFocus] = useState<number | null>(null);

  // Auto-focus the (`inputIndexToFocus`)th input box
  useEffect(() => {
    if (inputIndexToFocus !== null) {
      inputRefs.current[inputIndexToFocus]?.focus();
      setInputIndexToFocus(null);
    }
  }, [inputIndexToFocus]);

  return (
    <div id={id} className="flex flex-col gap-2">
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
   * Event handler to update the state to insert a new list item when "Enter", "Comma", or "Space" keys
   * are pressed.
   *
   * We insert a new list item when "Comma" or "Space" is pressed since it prevents users from listing
   * multiple items in a single input box.
   */
  onNewItemKeyPressed: () => void;
  /**
   * Event handler for deleting the this list item.
   */
  onDelete: () => void;
  /**
   * Additional class names to apply extra styling.
   */
  classNames?: {
    /** The input box. */
    input?: string;
  };
}

const Item = ({ index, onNewItemKeyPressed, onDelete, classNames, ...inputProps }: ItemProps) => {
  const { inputRefs, setInputIndexToFocus } = useListInputContext();

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
      case " ":
      case ",":
        event.preventDefault();
        onNewItemKeyPressed();
        setInputIndexToFocus(index + 1);
        break;
      // Auto-delete an empty input box
      case "Backspace":
      case "Delete":
        if (inputRefs.current[index]?.value === "") {
          onDelete();
          setInputIndexToFocus(index === 0 ? 0 : index - 1);
          event.preventDefault(); // Prevent deleting a character from the previous input box
        }
        break;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={(ref) => (inputRefs.current[index] = ref)}
        type="text"
        onKeyDown={handleInputKeyDown}
        className={clsx(
          "flex-1 px-3 py-1 border-0 border-b-2 border-gray-200 font-mono text-sm leading-6 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-blue-400 transition",
          classNames?.input,
        )}
        {...inputProps}
      />
      <button
        onClick={onDelete}
        title="Delete item"
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
      title="New item"
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
