import Cookies from "js-cookie";

/**
 * Initialize [Mock Service Worker](https://mswjs.io/) (MSW) for the browser and server. This allows
 * us to mock GraphQL requests in Cypress E2E tests.
 *
 * To use different handlers in different E2E tests, we use a cookie called `cypress:mock-file`.
 * It equals to the name of the file in `mocks/handlers` that contains the handlers for the test.
 * This cookie is set via the `/api/test-mock/add` API endpoint.
 *
 * ([Reference](https://dillonshook.com/testing-nextjs-with-cypress-and-msw/))
 */
export async function initMocks() {
  if (typeof window === "undefined") {
    // Make sure there's only one instance of the server
    if (!("serverMsw" in global)) {
      const { server } = await import("./server");
      global["serverMsw"] = { server };
      console.log("[MSW] Initialized server MSW");
    }
  } else {
    // Make sure there's only one instance of the worker
    if (!("msw" in window)) {
      const { worker } = await import("./browser");

      window["msw"] = { worker };
      console.log("[MSW] Initialized browser MSW");

      const mockFile = Cookies.get("cypress:mock-file");
      if (mockFile) {
        const nextRequestRegex = /(\/_next.*|telemetry.nextjs.org)/;
        await worker.start({
          onUnhandledRequest: (req) => {
            // Don't warn about _next api call's not being mocked
            if (req.url.pathname.match(nextRequestRegex)) return;
            console.warn("[MSW] unmocked request:", `${req.method} ${req.url.pathname}`);
          },
        });

        const allMocks = await import("mocks/handlers");
        const handlers = allMocks[mockFile].handlers;
        worker.use(...handlers);
        console.log(`[MSW] Add browser handlers for '${mockFile}'`);
      } else {
        worker.resetHandlers();
        worker.stop();
      }
    }
  }
}
