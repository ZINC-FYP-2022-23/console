import { InfoTooltip } from "@/components/GuiBuilder/Diagnostics";
import { memo } from "react";

/**
 * Tooltip for the "Additional packages" field.
 */
const AdditionalPackagesTooltip = memo(() => (
  <InfoTooltip width={450}>
    <ul className="px-3 text-sm list-disc">
      <li>If your container requires external dependencies, specify the package names here.</li>
      <li>
        They will be installed by your container&apos;s package manager (e.g. <code>apt-get</code>)
      </li>
    </ul>
  </InfoTooltip>
));
AdditionalPackagesTooltip.displayName = "AdditionalPackagesTooltip";

export default AdditionalPackagesTooltip;
