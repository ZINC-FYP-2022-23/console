import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { renderHook } from "@testing-library/react-hooks";
import { Store, StoreProvider } from "easy-peasy";
import React from "react";

/**
 * Initial values for different context providers in the wrapper of {@link renderHookWithContexts}.
 */
type RenderHookWrapperContexts = {
  /**
   * {@link https://easy-peasy.dev/ Easy Peasy} store.
   */
  store: Store;
  /**
   * Apollo client mocked responses.
   *
   * See https://www.apollographql.com/docs/react/development-testing/testing/#defining-mocked-responses
   */
  apollo?: ReadonlyArray<MockedResponse>;
};

/**
 * Equivalent to {@link https://react-hooks-testing-library.com/reference/api#renderhook renderHook} but with
 * multiple context providers as the wrapper.
 *
 * @param callback See {@link https://react-hooks-testing-library.com/reference/api#callback}
 * @param contexts Initial values for different context providers in the wrapper.
 */
const renderHookWithContexts = <TResult,>(
  callback: (props: { children: React.ReactNode }) => TResult,
  contexts: RenderHookWrapperContexts,
) =>
  renderHook(callback, {
    wrapper: ({ children }: { children: React.ReactNode }) => {
      return (
        <MockedProvider mocks={contexts.apollo} addTypename={false}>
          <StoreProvider store={contexts.store}>{children}</StoreProvider>
        </MockedProvider>
      );
    },
  });

export default renderHookWithContexts;
