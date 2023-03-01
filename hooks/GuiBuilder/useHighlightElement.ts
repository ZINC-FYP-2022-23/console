import highlightableElements from "@/constants/GuiBuilder/highlightableElements";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { Boarding } from "boarding.js";
import { useEffect } from "react";
// Custom tooltip styles are put in `index.css`

/**
 * Highlights elements in the GUI Assignment Builder page by dimming the rest of the page
 * except for the element to highlight.
 */
export default function useHighlightElement() {
  const elementToHighlight = useStoreState((state) => state.layout.elementToHighlight);
  const setElementToHighlight = useStoreActions((actions) => actions.layout.setElementToHighlight);

  useEffect(() => {
    if (!elementToHighlight) return;

    const boarding = new Boarding({
      opacity: 0.4,
      closeBtnText: "Close",
      onDeselected: () => setElementToHighlight(undefined),
    });

    const element = highlightableElements[elementToHighlight];

    // `setTimeout` buys time to let the DOM load the target elements before highlighting them
    setTimeout(() => {
      if (element.mode === "single") {
        boarding.highlight(element.selector);
      } else if (element.mode === "multiple") {
        boarding.defineSteps(element.steps);
        boarding.start();
      }
    }, 0);
  }, [elementToHighlight, setElementToHighlight]);
}
