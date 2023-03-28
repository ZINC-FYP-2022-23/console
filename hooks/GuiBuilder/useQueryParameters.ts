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

      // Set `step` query parameter
      if (router.query.assignmentConfigId === "new") {
        // Always start at first step when creating a new assignment
        if (typeof window !== "undefined") {
          router.replace({
            pathname: router.pathname,
            query: { ...router.query, step: guiBuilderSteps[0].slug },
          });
        }
      } else if (guiBuilderSteps.some((s) => s.slug === router.query.step)) {
        setStep(router.query.step as GuiBuilderStepSlug);
      }

      setIsFirstLoad(false);
    },

    /**
     * Changes which step the user is in by updating both the store state and the `step` query parameter.
     *
     * It is discouraged to jump >=2 steps ahead from the current step because users should complete each
     * step one by one in order. Jumping multiple steps ahead may cause issues.
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
