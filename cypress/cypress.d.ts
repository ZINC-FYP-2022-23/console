/**
 * @file TypeScript type definitions for custom Cypress commands, which are implemented in `cypress/support` folder.
 */

import { MultiSelect, Select } from "@/components/Input";
import { MountOptions, mount } from "cypress/react";
import { Store } from "easy-peasy";
import * as allMockedHandlers from "mocks/handlers";

declare global {
  namespace Cypress {
    interface Chainable {
      // #region commands.ts

      /**
       * Clicks a {@link MultiSelect} input, then clicks items from the dropdown menu, and closes the dropdown menu.
       * @param selector A selector to get the {@link Select} input.
       * @param contents List of text content of the items to click sequentially.
       * @example
       * cy.clickMultiSelectInput("#diff_ignore_flags", ["All space", "Blank lines"]);
       */
      clickMultiSelectInput: (selector: string, contents: string[]) => Chainable<void>;
      /**
       * Clicks outside the current element by clicking at the top-left corner of the body.
       */
      clickOutside: () => Chainable<any>;
      /**
       * Clicks a {@link Select} input and selects an item from the dropdown menu.
       * @param selector A selector to get the {@link Select} input.
       * @param content The text content of the item to select.
       * @example
       * cy.clickSelectItem("#visibility", "Always visible");
       */
      clickSelectInput: (selector: string, content: string) => Chainable<void>;

      // #endregion

      // #region components.tsx

      /**
       * Mounts a React component into the DOM. See {@link mount} from `"cypress/react"`.
       */
      mount: typeof mount;
      /**
       * Mounts a React component by wrapping it with an {@link https://easy-peasy.dev/ Easy Peasy}
       * store provider.
       */
      mountWithStore: (
        store: Store,
        jsx: React.ReactNode,
        options?: MountOptions,
        rerenderKey?: string,
      ) => ReturnType<typeof mount>;

      // #endregion

      // #region e2e.ts

      /**
       * Logs in the user with ID 1, ITSC `~ta`, and semester `2210`.
       */
      login: () => void;

      /**
       * Add mock request handlers to the [Mock Service Worker](https://mswjs.io/) (MSW). This can mock
       * GraphQL requests made by both the browser and the Next.js server.
       *
       * Generally, we use MSW handlers to mock GraphQL requests made during server-side rendering and
       * [`cy.intercept()`](https://docs.cypress.io/api/commands/intercept) for client-side requests.
       *
       * @param fileName The handler name to use in `mocks/handlers/index.ts`.
       * @example
       * // Add handlers from `mocks/handlers/global.ts`
       * cy.addMockHandlers("global");
       */
      addMockHandlers: (fileName: keyof typeof allMockedHandlers) => void;

      /**
       * Resets all mock request handlers in the [Mock Service Worker](https://mswjs.io/).
       */
      resetMockHandlers: () => void;

      // #endregion
    }
  }
}
