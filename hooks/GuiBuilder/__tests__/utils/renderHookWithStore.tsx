import { renderHook } from "@testing-library/react-hooks";
import { Store, StoreProvider } from "easy-peasy";
import React from "react";

/**
 * Equivalent to {@link https://react-hooks-testing-library.com/reference/api#renderhook renderHook} but with
 * an {@link https://easy-peasy.dev/ Easy Peasy} store provider as the wrapper.
 */
const renderHookWithStore = <TResult,>(store: Store, callback: (props: { children: React.ReactNode }) => TResult) =>
  renderHook(callback, {
    wrapper: ({ children }: { children: React.ReactNode }) => {
      return <StoreProvider store={store}>{children}</StoreProvider>;
    },
  });

export default renderHookWithStore;
