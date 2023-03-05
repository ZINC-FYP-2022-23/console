import { clsx } from "@mantine/core";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";

interface DateInputProps extends ReactDatePickerProps {
  /** Class name to apply additional styling on top of base styles. */
  className?: string;
}

/**
 * Date input component with a date picker.
 */
function DateInput({ className = "", ...props }: DateInputProps) {
  return (
    <DatePicker
      showTimeSelect
      className={clsx(
        "w-full px-3 py-2 placeholder:text-gray-400 border-none rounded-md focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300 sm:text-sm sm:leading-5 transition ease-in-out duration-150",
        className,
      )}
      dateFormat="MMMM d, yyyy h:mm aa"
      {...props}
    />
  );
}

export default DateInput;
