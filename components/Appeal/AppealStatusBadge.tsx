import { AppealStatus } from "@types";
import React from "react";

interface AppealStatusBadgeProps {
  status: AppealStatus;
}

const badgeColor = {
  [AppealStatus.Outstanding]: "bg-blue-100 text-blue-800",
  [AppealStatus.Completed]: "bg-green-100 text-green-800",
  [AppealStatus.Rejected]: "bg-red-100 text-red-800",
};

/**
 * A badge showing the status of an appeal.
 */
function AppealStatusBadge({ status }: AppealStatusBadgeProps) {
  return <p className={`max-w-fit px-3 py-0.5 font-medium rounded-full ${badgeColor[status]}`}>{status}</p>;
}

export default AppealStatusBadge;
