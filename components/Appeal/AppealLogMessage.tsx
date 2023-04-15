import { AppealLog, ChangeLogTypes } from "@/types/appeal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface AppealLogMessageType {
  /** Log to be displayed. */
  log: AppealLog;
  /** Whether to show the reason given by the TA for making that decision in the log. */
  showReason: boolean;
}

/**
 * Returns a component that shows a log message based on the log type
 */
export function AppealLogMessage({ log, showReason }: AppealLogMessageType) {
  const now = new Date();
  const logDate = new Date(log.date);
  logDate.setTime(logDate.getTime() + 8 * 60 * 60 * 1000);

  /** The icon to show at the left. */
  let icon: React.ReactNode | null = null;
  /** The content to render. */
  let content: React.ReactNode | null = null;

  // `APPEAL_SUBMISSION`-related log
  if (log.type === "APPEAL_SUBMISSION") {
    icon = (
      <div className="w-8 h-8 bg-blue-300 rounded-full flex justify-center items-center">
        <FontAwesomeIcon icon={["fad", "file"]} />
      </div>
    );
    content = (
      <p className="ml-2 text-sm text-gray-600">
        Your appeal was submitted on
        <span className="ml-1">
          {`${logDate.toLocaleDateString("en-HK", {
            month: "short",
            day: "numeric",
            ...(logDate.getFullYear() !== now.getFullYear() && { year: "numeric" }),
          })} at ${logDate.toLocaleTimeString().toLowerCase()}`}
        </span>
      </p>
    );
  }
  // `APPEAL_STATUS`-related log
  else if (log.type === ChangeLogTypes.APPEAL_STATUS && log.updatedState && log.updatedState.type === "status") {
    icon = (
      <div
        className="w-8 h-8 bg-yellow-300 rounded-full flex justify-center items-center"
        data-flow="up" // Location of tooltip on hovering the icon
        aria-label={`#${log.id}`}
      >
        <FontAwesomeIcon icon={["fad", "gavel"]} />
      </div>
    );
    content = (
      <p className="ml-2 text-sm text-gray-600">
        The appeal has been{" "}
        <span className="font-medium text-sm">
          {(() => {
            switch (log.updatedState.status) {
              case "ACCEPTED":
                return <span className="text-green-600">accepted</span>;
              case "REJECTED":
                return <span className="text-red-600">rejected</span>;
              case "PENDING":
                return <span className="text-yellow-600">pending for review</span>;
            }
          })()}
        </span>{" "}
        on
        <span className="ml-1">
          {`${logDate.toLocaleDateString("en-HK", {
            month: "short",
            day: "numeric",
            ...(logDate.getFullYear() !== now.getFullYear() && { year: "numeric" }),
          })} at ${logDate.toLocaleTimeString().toLowerCase()}`}
        </span>
        {showReason ? " with the following message:" : ""}
        {showReason && log.reason && (
          <div className="mt-1 text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: log.reason }} />
        )}
      </p>
    );
  }
  // `SCORE`-related log
  else if (
    log.type === ChangeLogTypes.SCORE &&
    log.updatedState &&
    log.updatedState.type === "score" &&
    log.originalState &&
    log.originalState.type === "score"
  ) {
    icon = (
      <div
        className="w-8 h-8 bg-yellow-600 rounded-full flex justify-center items-center"
        data-flow="up"
        aria-label={`#${log.id}`}
      >
        <FontAwesomeIcon icon={["fad", "star"]} />
      </div>
    );
    content = (
      <p className="ml-2 text-sm text-gray-600">
        The score has been updated
        {log.originalState && (
          <>
            {" from "}
            <span className="font-medium text-yellow-700">{log.originalState.score}</span>
          </>
        )}
        {log.updatedState && (
          <>
            {" to "}
            <span className="font-medium text-yellow-700">{log.updatedState.score}</span>
          </>
        )}
        {" on"}
        <span className="ml-1">
          {`${logDate.toLocaleDateString("en-HK", {
            month: "short",
            day: "numeric",
            ...(logDate.getFullYear() !== now.getFullYear() && { year: "numeric" }),
          })} at ${logDate.toLocaleTimeString().toLowerCase()}`}
        </span>
        {showReason && " with the following message:"}
        {showReason && log.reason && (
          <div className="mt-1 text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: log.reason }} />
        )}
      </p>
    );
  }
  // `SUBMISSION`-related log
  else if (
    log.type === ChangeLogTypes.SUBMISSION &&
    log.originalState &&
    log.originalState.type === "submission" &&
    log.updatedState &&
    log.updatedState.type === "submission"
  ) {
    icon = (
      <div
        className="w-8 h-8 bg-green-300 rounded-full flex justify-center items-center"
        data-flow="up"
        aria-label={`#${log.id}`}
      >
        <FontAwesomeIcon icon={["fad", "inbox-in"]} />
      </div>
    );
    content = (
      <p className="ml-2 text-sm text-gray-600">
        The submission has been changed on
        <span className="ml-1">
          {`${logDate.toLocaleDateString("en-HK", {
            month: "short",
            day: "numeric",
            ...(logDate.getFullYear() !== now.getFullYear() && { year: "numeric" }),
          })} at ${logDate.toLocaleTimeString().toLowerCase()}`}
        </span>
        {log.originalState && (
          <>
            {" from "}
            <span className="font-medium text-yellow-700"> from {log.originalState.submission}</span>
          </>
        )}
        {log.updatedState && (
          <>
            {" to "}
            <span className="font-medium text-yellow-700">{log.updatedState.submission}</span>
          </>
        )}
      </p>
    );
  }
  // Unidentified log
  else {
    icon = (
      <div
        className="w-8 h-8 bg-red-300 rounded-full flex justify-center items-center"
        data-flow="up"
        aria-label={`#${log.id}`}
      >
        <FontAwesomeIcon icon={["fad", "exclamation"]} />
      </div>
    );
    content = <p className="ml-2 text-sm text-red-600">ERROR: Log cannot be identified and shown.</p>;
  }

  return (
    <>
      <div className="mx-12 h-12 border-l-2" />
      <div className="mx-8 flex justify-between">
        <div className="flex">
          {icon}
          <div className="mt-1.5">{content}</div>
        </div>
      </div>
    </>
  );
}
