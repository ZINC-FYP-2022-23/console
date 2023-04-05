import { serialize } from "cookie";
import { SetupServer } from "msw/lib/node";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Resets all request handlers of the [Mock Service Worker](https://mswjs.io/). This essential resets
 * all mock GraphQL requests in the Next.js server.
 *
 * This endpoint is called in Cypress E2E tests. ([Reference](https://dillonshook.com/testing-nextjs-with-cypress-and-msw/))
 */
export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  if (process.env.NEXT_PUBLIC_IA_ENV === "production") {
    res.status(405);
    return;
  }

  try {
    res.setHeader("Cache-Control", "no-cache");

    if ("serverMsw" in global) {
      console.log("[MSW] Reset handlers");
      const serverMsw = global.serverMsw as { server: SetupServer };
      serverMsw.server.resetHandlers();
      res.setHeader(
        "Set-Cookie",
        serialize("cypress:mock-file", "", {
          path: "/",
          sameSite: "lax",
        }),
      );

      res.status(200).json({ status: "Reset Handlers" });
    } else {
      res.status(400).json({ status: "Mock server not initialized" });
    }
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.toString() });
  }
}
