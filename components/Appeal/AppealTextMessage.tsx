import { DisplayMessageType } from "@/types/appeal";

type IconProps = {
  name: string;
  type: "Student" | "Teaching Assistant";
};

/**
 * Returns a circular Icon representing the user
 * @param {string} name - User name
 * @param {"Student" | "Teaching Assistant"} type - User type
 */
function Icon({ name, type }: IconProps) {
  let backgroundColor: string;
  switch (type) {
    case "Student":
      backgroundColor = "bg-blue-700";
      break;
    case "Teaching Assistant":
      backgroundColor = "bg-red-800";
      break;
    default:
      backgroundColor = "bg-gray-800";
  }

  const css = "w-8 h-8 leading-8 rounded-full text-white font-bold text-lg text-center " + backgroundColor;
  return <div className={css}>{name.charAt(0)}</div>;
}

/**
 * Returns a component of a line of Text Message
 * @param {DisplayMessageType} message - Appeal Text Message
 */
export function AppealTextMessage({ message }: { message: DisplayMessageType }) {
  const { name, type, time, content } = message;

  const now = new Date();
  const logDate = new Date(time);
  logDate.setTime(logDate.getTime() + 8 * 60 * 60 * 1000);

  return (
    <>
      <div className="mx-12 h-12 border-l-2"></div>
      <div className="mx-8 flex justify-between">
        <div className="flex flex-row space-x-2">
          <Icon name={name} type={type} />
          <div className="overflow-x-auto">
            <div className="flex flex-row space-x-2">
              <p className="ml-2 text-sm text-gray-600 font-bold">{name}</p>
              <p className="ml-2 text-sm text-gray-500">({type})</p>
              <p className="ml-1 text-sm text-gray-600">
                {`${logDate.toLocaleDateString("en-HK", {
                  month: "short",
                  day: "numeric",
                  ...(logDate.getFullYear() !== now.getFullYear() && { year: "numeric" }),
                })} at ${logDate.toLocaleTimeString().toLowerCase()}`}
              </p>
            </div>
            <p className="ml-2 text-sm text-gray-900">{content}</p>
          </div>
        </div>
      </div>
    </>
  );
}
