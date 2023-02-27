/**
 * @file Input options for Scorable-related select inputs.
 */

import { SelectItem } from "@/components/Input";
import { DenormalPolicy } from "@/types/GuiBuilder";

/**
 * Select input options for {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#total-based-scorable Total-Based Scorable}'s
 * denormal policy.
 */
export const denormalPolicySelectOptions: SelectItem<DenormalPolicy>[] = [
  {
    value: "IGNORE",
    label: "This stage will not contribute to the final score",
  },
  {
    value: "FAILURE",
    label: "This stage will get a score of 0",
  },
  {
    value: "SUCCESS",
    label: "This stage will get a full score",
  },
];
