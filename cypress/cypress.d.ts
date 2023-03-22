/**
 * @file TypeScript type definitions for custom Cypress commands, which are implemented in `cypress/support` folder.
 */

import { mount, MountOptions, MountReturn } from "cypress/react";
import { Store } from "easy-peasy";

declare global {
  namespace Cypress {
    interface Chainable {
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
      ) => Chainable<MountReturn>;
    }
  }
}
