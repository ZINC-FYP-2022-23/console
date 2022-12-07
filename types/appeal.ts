import { NumberInputStylesNames } from "@mantine/core";

export enum AppealStatus {
  Accept = "Accepted",
  Reject = "Rejected",
  Pending = "Pending",
}

export type Appeal = {
  id: number;
  name: string;
  sid: string;
  email: string;
  status: AppealStatus;
  updatedAt: string;
  originalScore: number;
  finalScore?: number;
};
