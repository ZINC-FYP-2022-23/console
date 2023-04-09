# ZINC - Console UI

ZINC UI for teaching assistants, powered by [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

## Setting Up

### Repo Setup

1. Make sure you have installed the [Yarn](https://yarnpkg.com/getting-started/install) package manager.
2. This project uses the [Font Awesome](https://fontawesome.com/) Pro Plan icon library. Please obtain its secret NPM token and register it by running:

   ```bash
   yarn config set "//npm.fontawesome.com/:_authToken" <FONT-AWESOME-PACKAGE-TOKEN>
   ```

3. Run `yarn` at the root of the project to install dependencies.
4. If you're developing locally, copy the example environment variables file.

   ```bash
   cp .env.local.example .env.local
   ```

### Development Server

The UI depends on the following backend services. They should be running **before** starting the Console UI development server.

- [Webhook](https://github.com/zinc-sig/webhook)
- PostgreSQL database
- Redis - IPC communication
- [Hasura](https://hasura.io/) - GraphQL engine for PostgreSQL
- [Grader](https://gitlab.com/zinc-stack/grader) - Grades submissions
  - See [Building and Running](https://docs.zinc.ust.dev/developer/install.html) to learn how to build and run the Grader daemon

You need to specify the URLs and port numbers of these backend services using environment variables. You should populate the `.env.local` file if you are running Console UI locally.

Finally, run `yarn dev` to start the development server.

## Production

Run `yarn build` to build the project for production, followed by `yarn start` to start the production server.

## Testing

There are three types of tests: unit tests, component tests, and end-to-end (E2E) tests.

### Unit Tests

Unit tests written in [Jest](https://jestjs.io/) are located in the `**/__tests__` directory. To run the tests, run `yarn test` at the root of the project.

### Component Tests

Component tests written in [Cypress](https://www.cypress.io/) are located in the `cypress/components` directory. There are two ways to run the tests:

- Run `yarn cypress` to open the Cypress Test Runner and run tests interactively in a browser.
- Run `yarn cypress:run:component` to run component tests in headless mode.

### E2E Tests

E2E tests written in [Cypress](https://www.cypress.io/) are located in the `cypress/e2e` directory. To run the tests:

1. Run `yarn dev:mocked` to start the development server with [Mock Service Worker](https://mswjs.io/) (MSW) enabled.
   - MSW is used for mocking both server-side and client-side API requests.
   - The mocked [handlers](https://mswjs.io/docs/basics/request-handler) are located in the `mocks/handlers` directory.
2. In a **new** Terminal, either run:
   - `yarn cypress` to open the Cypress Test Runner and run tests interactively in a browser.
   - `yarn cypress:run` to run E2E tests in headless mode.

## Recommended Editor Tools

- [Prettier](https://prettier.io/docs/en/editors.html) - Code formatter
- [ESLint](https://eslint.org/docs/latest/use/integrations) - Linter
- [Tailwind CSS IntelliSense](https://tailwindcss.com/docs/editor-setup) - Auto-complete for Tailwind CSS classes
