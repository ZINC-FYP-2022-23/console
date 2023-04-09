import { serialize } from "cookie";
import { RequestHandler } from "msw";
import { SetupServer } from "msw/lib/node";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Register request handlers from the `mocks/handlers` folder to the [Mock Service Worker](https://mswjs.io/),
 * so that it can mock GraphQL requests during server-side rendering.
 *
 * Example: `GET /api/test-mock/add?file=global` will add the handlers from `mocks/handlers/global.ts`
 * to the Mock Service Worker (MSW).
 *
 * This endpoint is called in Cypress E2E tests. ([Reference](https://dillonshook.com/testing-nextjs-with-cypress-and-msw/))
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NEXT_PUBLIC_IA_ENV === "production") {
    res.status(405);
    return;
  }

  try {
    res.setHeader("Cache-Control", "no-cache");

    const fileName = req.query.file;
    if (!fileName || typeof fileName !== "string") {
      res.status(400).json({ status: "Missing file param", fileName });
      return;
    }

    const allMocks = await import("mocks/handlers");
    const handlers: RequestHandler[] = allMocks[fileName as keyof typeof allMocks].handlers;

    if (!("serverMsw" in global) && process.env.NEXT_PUBLIC_MOCKS_ENABLED) {
      // Auto start up MSW if it hasn't been yet. This can happen if this is the first request
      // from Cypress before a page has loaded.
      console.log("[MSW] Initialize mocks");
      const { initMocks } = await import("mocks");
      await initMocks();
    }

    if ("serverMsw" in global) {
      console.log(`[MSW] Add server handlers for '${fileName}'`);
      const serverMsw = global["serverMsw"] as { server: SetupServer };
      serverMsw.server.listen({ onUnhandledRequest: "warn" });
      serverMsw.server.use(...handlers);
      res.setHeader(
        "Set-Cookie",
        serialize("cypress:mock-file", fileName, {
          path: "/",
          sameSite: "lax",
        }),
      );

      res.status(200).json({
        status: "Added Server Handlers",
        handlers: handlers.map((h) => h.info.header),
      });
    } else {
      res.status(400).json({ status: "Mock server not initialized." });
    }
  } catch (e: any) {
    if (req.query.file) {
      console.error("Error trying to add mock " + req.query.file);
    }
    console.error(e);
    res.status(500).json({ error: e.toString() });
  }
}
