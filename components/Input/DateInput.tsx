import { setHours, setMinutes } from "date-fns";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";

interface DateInputProps extends ReactDatePickerProps {}

/**
 * Date input component with a date picker.
 */
function DateInput({ ...props }: DateInputProps) {
  return (
    <DatePicker
      showTimeSelect
      className="form-input block w-full placeholder:text-gray-400 border-none rounded-md focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300 sm:text-sm sm:leading-5 transition ease-in-out duration-150"
      dateFormat="MMMM d, yyyy h:mm aa"
      {...props}
    />
  );
}

export default DateInput;
