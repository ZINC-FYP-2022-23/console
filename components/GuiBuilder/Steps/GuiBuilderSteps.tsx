import { Spinner } from "@/components/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";

export type GuiBuilderStepSlug = "settings" | "pipeline" | "upload" | "test" | "assign";

export type GuiBuilderStep = Readonly<{
  slug: GuiBuilderStepSlug;
  label: string;
  icon: React.ReactNode;
  /**
   * The component to render in the step.
   *
   * It should be dynamically imported to reduce the bundle size.
   */
  component: React.ComponentType<{}>;
}>;

const StepLoading = () => (
  <div className="my-20 flex flex-col items-center justify-center">
    <Spinner className="h-14 w-14 text-cse-500" />
  </div>
);

/**
 * Steps in the GUI Assignment Builder.
 */
const guiBuilderSteps: readonly GuiBuilderStep[] = [
  {
    slug: "settings",
    label: "General Settings",
    icon: <FontAwesomeIcon icon={["fad", "gears"]} />,
    component: dynamic(() => import("./GeneralSettings"), {
      loading: () => <StepLoading />,
    }),
  },
  {
    slug: "pipeline",
    label: "Pipeline Stages",
    icon: <FontAwesomeIcon icon={["fad", "pipe-section"]} />,
    component: dynamic(() => import("./PipelineStages"), {
      loading: () => <StepLoading />,
    }),
  },
  {
    slug: "upload",
    label: "Upload Files",
    icon: <FontAwesomeIcon icon={["fad", "upload"]} />,
    component: dynamic(() => import("./UploadFiles"), {
      loading: () => <StepLoading />,
    }),
  },
  {
    slug: "test",
    label: "Submissions",
    icon: <FontAwesomeIcon icon={["fad", "flask"]} />,
    component: dynamic(() => import("./TestSubmission"), {
      loading: () => <StepLoading />,
    }),
  },
  {
    slug: "assign",
    label: "Assign Students",
    icon: <FontAwesomeIcon icon={["fad", "sitemap"]} />,
    component: dynamic(() => import("./AssignStudents"), {
      loading: () => <StepLoading />,
    }),
  },
];

export default guiBuilderSteps;
