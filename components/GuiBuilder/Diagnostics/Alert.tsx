import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "@mantine/core";

type AlertSeverity = "info" | "warning" | "error";

interface AlertProps {
  severity: AlertSeverity;
  children: React.ReactNode;
  /**
   * Callback when the close button is pressed. No close button will be rendered if this is not provided.
   */
  onClose?: () => void;
}

const severityToIconName: Record<AlertSeverity, IconName> = {
  info: "circle-question",
  warning: "triangle-exclamation",
  error: "circle-exclamation",
};

/**
 * An alert to attract the user's attention with important static message.
 */
function Alert({ severity, children, onClose }: AlertProps) {
  return (
    <div
      className={clsx(
        "px-4 py-3 flex items-start gap-4 rounded-md",
        severity === "info" && "bg-sky-100 text-sky-800",
        severity === "warning" && "bg-yellow-100 text-yellow-800",
        severity === "error" && "bg-red-100 text-red-800",
      )}
    >
      <FontAwesomeIcon
        icon={["far", severityToIconName[severity]]}
        className={clsx(
          "text-xl ",
          severity === "info" && "text-sky-600",
          severity === "warning" && "text-yellow-600",
          severity === "error" && "text-red-600",
        )}
      />
      {children}
      {onClose && (
        <button
          onClick={onClose}
          title="Close"
          className="h-6 w-6 ml-auto flex-none flex items-center justify-center rounded-full transition hover:bg-black/10"
        >
          <FontAwesomeIcon icon={["far", "times"]} />
        </button>
      )}
    </div>
  );
}

export default Alert;
