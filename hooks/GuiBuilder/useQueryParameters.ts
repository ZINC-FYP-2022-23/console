import guiBuilderSteps, { GuiBuilderStepSlug } from "@/components/GuiBuilder/Steps/GuiBuilderSteps";
import { useStoreActions } from "@/store/GuiBuilder";
import { useRouter } from "next/router";
import { useState } from "react";

/**
 * Query parameters used by the GUI Assignment Builder.
 */
export type GuiBuilderQueryParams = {
  /** Which step is the user in. It should equal to a value from {@link GuiBuilderStepSlug}. */
  step?: string;
};

/**
 * Returns utility functions for synchronizing the page's query parameters with the GUI Assignment
 * Builder's store state.
 *
 * @deprecated Do **NOT** use this hook yet. When Anson tried using this hook to add the `step` query parameter,
 * the GUI Assignment Builder page would randomly freeze. Calling `updateStep()` would also reset the entire store
 * state for unknown reasons. Until the cause and the solution are found, this hook should **not** be used.
 */
function useQueryParameters() {
  const router = useRouter();
  const setStep = useStoreActions((actions) => actions.layout.setStep);

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  return {
    /**
     * When the user first enters the page, use the query parameters to initialize the store state.
     */
    initializeStateFromQueryParams: () => {
      if (!isFirstLoad) return;

      if (guiBuilderSteps.some((s) => s.slug === router.query.step)) {
        setStep(router.query.step as GuiBuilderStepSlug);
      }

      setIsFirstLoad(false);
    },

    /**
     * Changes which step the user is in by updating both the store state and the `step` query parameter.
     */
    updateStep: (step: GuiBuilderStepSlug) => {
      setStep(step);
      router.replace({
        pathname: router.pathname,
        query: { ...router.query, step },
      });
    },
  };
}

export default useQueryParameters;
