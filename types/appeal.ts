export enum AppealStatus {
  Accept = "Accepted",
  Reject = "Rejected",
  Pending = "Pending",
}

export type Appeal = {
  id: number;
  name: string;
  itsc: string;
  status: AppealStatus;
  updatedAt: string;
  originalScore: number;
  finalScore?: number;
};
