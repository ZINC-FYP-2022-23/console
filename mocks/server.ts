import { setupServer } from "msw/node";
import { handlers } from "./handlers/global";

export const server = setupServer(...handlers);
