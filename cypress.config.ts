import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // It can be overridden by the `CYPRESS_BASE_URL` env variable.
    // See https://docs.cypress.io/guides/guides/environment-variables
    baseUrl: "http://localhost:3000",
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
