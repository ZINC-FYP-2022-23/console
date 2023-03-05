import { Spinner } from "@/components/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";

export type GuiBuilderStepSlug = "settings" | "pipeline" | "upload" | "test" | "assign";

export type GuiBuilderStep = Readonly<{
  slug: GuiBuilderStepSlug;
  label: string;
  icon: React.ReactNode;
  /**
   * Whether the step is locked when creating a brand new config.
   *
   * This is because some steps must require a non-null config ID in order to properly work,
   * and config ID is `null` when creating a new config.
   */
  lockedWhenNew: boolean;
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
    lockedWhenNew: true,
    component: dynamic(() => import("./GeneralSettings"), {
      loading: () => <StepLoading />,
    }),
  },
  {
    slug: "pipeline",
    label: "Pipeline Stages",
    icon: <FontAwesomeIcon icon={["fad", "pipe-section"]} />,
    lockedWhenNew: true,
    component: dynamic(() => import("./PipelineStages"), {
      loading: () => <StepLoading />,
    }),
  },
  {
    slug: "upload",
    label: "Upload Files",
    icon: <FontAwesomeIcon icon={["fad", "upload"]} />,
    lockedWhenNew: false,
    component: dynamic(() => import("./UploadFiles"), {
      loading: () => <StepLoading />,
    }),
  },
  {
    slug: "test",
    label: "Submissions",
    icon: <FontAwesomeIcon icon={["fad", "flask"]} />,
    lockedWhenNew: false,
    component: dynamic(() => import("./TestSubmission"), {
      loading: () => <StepLoading />,
    }),
  },
  {
    slug: "assign",
    label: "Assign Students",
    icon: <FontAwesomeIcon icon={["fad", "sitemap"]} />,
    lockedWhenNew: false,
    component: dynamic(() => import("./AssignStudents"), {
      loading: () => <StepLoading />,
    }),
  },
];

export default guiBuilderSteps;
