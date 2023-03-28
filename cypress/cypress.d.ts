/**
 * @file TypeScript type definitions for custom Cypress commands, which are implemented in `cypress/support` folder.
 */

import { MultiSelect, Select } from "@/components/Input";
import { mount, MountOptions } from "cypress/react";
import { Store } from "easy-peasy";

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
       *
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
    }
  }
}
