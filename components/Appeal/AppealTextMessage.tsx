import { DisplayMessageType } from "@/types/appeal";

interface IconProps {
  name: string; // User name
  type: "Student" | "Teaching Assistant"; // User type
}

/**
 *  Returns a circular Icon representing the user
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

  let letter: string;
  if (name.length > 0) letter = name.charAt(0);
  else letter = name;

  const css = "w-8 h-8 leading-8 rounded-full text-white font-bold text-lg text-center " + backgroundColor;
  return <div className={css}>{letter}</div>;
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

  let backgroundColor: string;
  let borderColor: string;
  switch (type) {
    case "Student":
      backgroundColor = "bg-blue-100 ";
      borderColor = "border-blue-800 ";
      break;
    case "Teaching Assistant":
      backgroundColor = "bg-red-100 ";
      borderColor = "border-red-800 ";
      break;
    default:
      backgroundColor = "bg-gray-100 ";
      borderColor = "border-gray-800 ";
  }
  const backgroundCSS = "p-3 mx-8 flex justify-between rounded-lg border-2 " + backgroundColor + borderColor;

  return (
    <>
      <div className="h-8" />
      <div className={backgroundCSS}>
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
            <div className="ml-2 text-m text-gray-900" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </div>
    </>
  );
}
