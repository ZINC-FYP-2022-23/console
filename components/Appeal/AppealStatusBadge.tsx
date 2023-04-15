import { AppealStatus } from "@/types";
import React from "react";

interface AppealStatusBadgeProps {
  status: AppealStatus;
}

const badgeColor = {
  [AppealStatus.PENDING]: "bg-blue-100 text-blue-800",
  [AppealStatus.ACCEPTED]: "bg-green-100 text-green-800",
  [AppealStatus.REJECTED]: "bg-red-100 text-red-800",
};

/**
 * A badge showing the status of an appeal.
 */
function AppealStatusBadge({ status }: AppealStatusBadgeProps) {
  return <p className={`max-w-fit w-max px-3 py-0.5 font-medium rounded-full ${badgeColor[status]}`}>{status}</p>;
}

export default AppealStatusBadge;
