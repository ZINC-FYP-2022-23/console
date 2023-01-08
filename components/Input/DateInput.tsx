import DatePicker, { ReactDatePickerProps } from "react-datepicker";

interface DateInputProps extends ReactDatePickerProps {}

/**
 * Date input component with a date picker.
 */
function DateInput({ ...props }: DateInputProps) {
  return (
    <DatePicker
      showTimeSelect
      className="w-full px-3 py-2 placeholder:text-gray-400 border-none rounded-md focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300 sm:text-sm sm:leading-5 transition ease-in-out duration-150"
      dateFormat="MMMM d, yyyy h:mm aa"
      {...props}
    />
  );
}

export default DateInput;
