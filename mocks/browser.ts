import { setupWorker } from "msw";
import { handlers } from "./handlers/global";

export const worker = setupWorker(...handlers);
