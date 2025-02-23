import { clsx, ScrollArea } from "@mantine/core";
import PipelineSettings from "../Settings/PipelineSettings";
import Policy from "../Settings/Policy";
import Scheduling from "../Settings/Scheduling";

function GeneralSettings() {
  return (
    <div className="h-full flex gap-3">
      <GeneralSettingsCard className="w-1/2 h-full" title="Pipeline Settings">
        <PipelineSettings />
      </GeneralSettingsCard>
      <div className="w-1/2 h-full flex flex-col gap-3">
        <GeneralSettingsCard title="Policy">
          <Policy />
        </GeneralSettingsCard>
        <GeneralSettingsCard className="flex-1" title="Scheduling">
          <Scheduling />
        </GeneralSettingsCard>
      </div>
    </div>
  );
}

interface GeneralSettingsCardProps {
  title: string;
  children: React.ReactNode;
  /** Additional classes to apply to root of the card. */
  className?: string;
}

function GeneralSettingsCard({ title, children, className }: GeneralSettingsCardProps) {
  return (
    <div className={clsx("flex flex-col bg-white rounded-md shadow overflow-y-hidden", className)}>
      <h2 className="px-4 py-2 text-xl font-semibold bg-blue-50 border-b border-gray-300">{title}</h2>
      <ScrollArea type="auto" offsetScrollbars className="flex-1 px-3 py-4 pb-5">
        {children}
      </ScrollArea>
    </div>
  );
}

export default GeneralSettings;
