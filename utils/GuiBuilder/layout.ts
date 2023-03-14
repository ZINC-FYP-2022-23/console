/**
 * @file Layout-related utilities.
 */

import guiBuilderSteps, { GuiBuilderStepSlug } from "@/components/GuiBuilder/Steps/GuiBuilderSteps";

/**
 * @returns The slug of the next step in the GUI Assignment Builder. It is `null` if the current step
 * is the last one.
 */
export function getNextStepSlug(currentStep: GuiBuilderStepSlug): GuiBuilderStepSlug | null {
  const currentIdx = guiBuilderSteps.findIndex((step) => step.slug === currentStep);
  if (currentIdx === -1) {
    console.error(`Failed to find slug "${currentStep}" in the list of steps.`);
    return null;
  }
  return currentIdx === guiBuilderSteps.length - 1 ? null : guiBuilderSteps[currentIdx + 1].slug;
}
