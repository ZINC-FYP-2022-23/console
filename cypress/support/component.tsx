import { IconPack, library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fad } from "@fortawesome/pro-duotone-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { mount, MountOptions } from "cypress/react";
import { Store, StoreProvider } from "easy-peasy";
import "../../dist/index.css";

Cypress.Commands.add("mount", (jsx: React.ReactNode, options?: MountOptions, rerenderKey?: string) => {
  // Register Font Awesome icons
  library.add(fad, far, fas as IconPack);

  return mount(jsx, options, rerenderKey);
});

Cypress.Commands.add("mountWithStore", (store: Store, jsx, options, rerenderKey) => {
  return cy.mount(<StoreProvider store={store}>{jsx}</StoreProvider>, options, rerenderKey);
});
