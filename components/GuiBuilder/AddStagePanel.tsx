import Button from "@components/Button";
import supportedStages, { SupportedStage } from "@constants/Config/supportedStages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Accordion, createStyles, Tooltip } from "@mantine/core";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { AccordionState } from "@state/GuiBuilder/Store";
import { StageKind } from "@types";
import { configToYaml } from "@utils/Config";
import { memo } from "react";
import AddableStage from "./PipelineEditor/AddableStage";

type AccordionKeys = AccordionState["addNewStage"][number];

const categoryLabel: Record<AccordionKeys, string> = {
  preCompile: "Pre-Compile",
  compile: "Compile",
  testCases: "Test Cases",
  miscStages: "Misc Stages",
};

const getCategoryByKind = (kind: StageKind): AccordionKeys => {
  switch (kind) {
    case StageKind.PRE_GLOBAL:
      return "preCompile";
    case StageKind.PRE_LOCAL:
      return "compile";
    case StageKind.GRADING:
      return "testCases";
    case StageKind.POST:
    case StageKind.CONSTANT:
      return "miscStages";
  }
};

const getStagesByCategory = () => {
  const output: Record<AccordionKeys, { [stageName: string]: SupportedStage }> = {
    preCompile: {},
    compile: {},
    testCases: {},
    miscStages: {},
  };
  Object.entries(supportedStages).forEach(([name, data]) => {
    const category = getCategoryByKind(data.kind);
    output[category][name] = data;
  });
  return output;
};

/** Styles for the {@link https://mantine.dev/core/accordion Mantine Accordion} component. */
const useStyles = createStyles((theme) => ({
  item: {
    backgroundColor: "#f3f4f6",
  },
  control: {
    padding: "8px 12px",
    ":hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  label: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 600,
  },
  content: {
    padding: "16px 12px",
    backgroundColor: "#ffffff",
  },
}));

function AddStagePanel() {
  const { classes } = useStyles();
  const stagesByCategory = getStagesByCategory();

  const editingConfig = useStoreState((state) => state.editingConfig);
  const accordion = useStoreState((state) => state.layout.accordion.addNewStage);
  const setAccordion = useStoreActions((action) => action.setAccordion);
  const toggleAddStageCollapsed = useStoreActions((action) => action.toggleAddStageCollapsed);

  const expandAllAccordions = () => {
    setAccordion({ path: "addNewStage", value: ["preCompile", "compile", "testCases", "miscStages"] });
  };

  return (
    <>
      <div className="pl-2 pr-3 py-2 flex items-center justify-between border-b border-gray-300">
        <Tooltip label="Collapse panel">
          <button
            onClick={() => toggleAddStageCollapsed()}
            className="p-2 text-2xl leading-[0] text-gray-600 rounded-full transition hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={["fad", "arrow-right-to-line"]} className="w-6 h-6" />
          </button>
        </Tooltip>
        <div className="flex items-center justify-end gap-2">
          <Button
            className="text-violet-600 border border-violet-600 hover:bg-violet-100 active:bg-violet-200"
            onClick={() => console.log(configToYaml(editingConfig))}
          >
            Debug: Log YAML
          </Button>
        </div>
      </div>
      <div className="p-3 pt-2 sticky top-0 z-10 bg-blue-50 border-b border-gray-300">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl">Add New Stage</h2>
          <div className="flex items-center gap-3">
            <Tooltip label="Expand all">
              <button
                onClick={() => expandAllAccordions()}
                className="p-2 text-xl leading-[0] text-cse-600 rounded-full transition hover:bg-blue-200 active:bg-blue-300"
              >
                <FontAwesomeIcon icon={["far", "up-right-and-down-left-from-center"]} />
              </button>
            </Tooltip>
            <Tooltip label="Collapse all">
              <button
                onClick={() => setAccordion({ path: "addNewStage", value: [] })}
                className="p-2 text-xl leading-[0] text-cse-600 rounded-full transition hover:bg-blue-200 active:bg-blue-300"
              >
                <FontAwesomeIcon icon={["far", "down-left-and-up-right-to-center"]} />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="mt-3 flex items-center text-sm text-justify text-blue-500 leading-4">
          <FontAwesomeIcon icon={["far", "circle-question"]} className="mr-2" />
          <p>To add a new stage, drag a stage block to the canvas.</p>
        </div>
      </div>
      {Object.entries(stagesByCategory).map(([category, stages]) => (
        <Accordion
          key={category}
          multiple
          value={accordion}
          onChange={(value) => setAccordion({ path: "addNewStage", value })}
          classNames={classes}
        >
          <Accordion.Item value={category}>
            <Accordion.Control>{categoryLabel[category]}</Accordion.Control>
            <Accordion.Panel>
              <div className="flex flex-col gap-5 text-sm">
                {Object.entries(stages).map(([name, data]) => (
                  <AddableStage key={name} stageName={name} stageData={data} />
                ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      ))}
    </>
  );
}

/**
 * The collapsed version of Add Stage Panel.
 */
export function AddStagePanelCollapsed() {
  const toggleAddStageCollapsed = useStoreActions((action) => action.toggleAddStageCollapsed);

  return (
    <div className="p-2 flex flex-col gap-4">
      <Tooltip label="Add New Stage" position="left">
        <button
          onClick={() => toggleAddStageCollapsed()}
          className="p-2 text-2xl leading-[0] text-cse-600 rounded-full transition hover:bg-blue-100 active:bg-blue-200"
        >
          <FontAwesomeIcon icon={["fas", "add"]} className="w-6 h-6" />
        </button>
      </Tooltip>
    </div>
  );
}

export default memo(AddStagePanel);
