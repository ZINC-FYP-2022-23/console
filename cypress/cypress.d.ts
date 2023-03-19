/**
 * @file TypeScript type definitions for custom Cypress commands, which are implemented in `cypress/support` folder.
 */

import { mount } from "cypress/react";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Mounts a React component into the DOM. See {@link mount} from `"cypress/react"`.
       */
      mount: typeof mount;
    }
  }
}
