import Button from "@/components/Button";
import { TextInput } from "@/components/Input";
import supportedStages, { SupportedStage } from "@/constants/GuiBuilder/supportedStages";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx, createStyles, ScrollArea, Tooltip } from "@mantine/core";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import UnsupportedStage from "./UnsupportedStage";

const labelAlerts = {
  duplicateName: {
    severity: "error",
    message: <p>This label is already in use.</p>,
  },
  hasColon: {
    severity: "error",
    message: <p>Do not put colons (:) in the label.</p>,
  },
  discouragedChars: {
    severity: "warning",
    message: (
      <p>
        Prefer to only use <span className="font-semibold">letters</span> (a-z,A-Z) and{" "}
        <span className="font-semibold">numbers</span> (0-9).
      </p>
    ),
  },
} as const;

/**
 * Settings panel for an individual stage in the pipeline.
 */
function StageSettings() {
  const { classes } = useScrollAreaStyles();
  const labelInputRef = useRef<HTMLInputElement>(null!);
  const [labelAlertKey, setLabelAlertKey] = useState<keyof typeof labelAlerts | null>(null);

  const selectedStage = useStoreState((state) => state.pipelineEditor.selectedStage);
  const isStageLabelDuplicate = useStoreState((state) => state.config.isStageLabelDuplicate);
  const numOfNodes = useStoreState((state) => state.pipelineEditor.numOfNodes);
  const shouldFocusLabelInput = useStoreState((state) => state.pipelineEditor.shouldFocusLabelInput);
  const updateSelectedStage = useStoreActions((actions) => actions.config.updateSelectedStage);
  const setModal = useStoreActions((actions) => actions.layout.setModal);
  const setShouldFocusLabelInput = useStoreActions((actions) => actions.pipelineEditor.setShouldFocusLabelInput);

  const validateStageLabel = useCallback(
    (label: string) => {
      if (label.includes(":")) {
        setLabelAlertKey("hasColon");
      } else if (label.match(/[^a-zA-Z0-9]/)) {
        setLabelAlertKey("discouragedChars");
      } else if (selectedStage && isStageLabelDuplicate(selectedStage.name, label)) {
        setLabelAlertKey("duplicateName");
      } else {
        setLabelAlertKey(null);
      }
    },
    [isStageLabelDuplicate, selectedStage],
  );

  useEffect(() => {
    if (selectedStage) {
      validateStageLabel(selectedStage.label);
    }
  }, [selectedStage, validateStageLabel]);

  // Focus stage label input box
  useEffect(() => {
    if (shouldFocusLabelInput) {
      labelInputRef.current.focus();
      setShouldFocusLabelInput(false);
    }
  }, [shouldFocusLabelInput, setShouldFocusLabelInput]);

  if (numOfNodes === 0) {
    return <AddStageHint />;
  }
  if (selectedStage === null) {
    return <NoStageSelected />;
  }

  const stageName = selectedStage.name;
  const supportedStage: SupportedStage | undefined = supportedStages[stageName];
  const StageSettings = supportedStage?.stageSettings ?? UnsupportedStage;
  const labelAlert = labelAlertKey ? labelAlerts[labelAlertKey] : null;

  return (
    <div className="h-full flex flex-col bg-white rounded-md shadow overflow-y-hidden">
      <div className="px-3 py-2 bg-blue-50 border-b border-gray-300">
        <div className="flex justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">{supportedStage?.nameInUI ?? stageName}</h2>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={["fas", "tag"]} className="mr-1 text-gray-500" />
            <p className="text-gray-500 text-sm font-medium">Label:</p>
            <TextInput
              ref={labelInputRef}
              value={selectedStage.label}
              onChange={(event) => {
                const value = event.target.value;
                validateStageLabel(value);
                updateSelectedStage({ path: "label", value });
              }}
              alertLevel={labelAlert?.severity}
              classNames={{ root: "w-36 mx-2", input: "!px-2 !py-1 !leading-4" }}
            />
            <Tooltip label="Open help dialog" openDelay={500}>
              <button
                onClick={() => setModal({ path: "stageLabelInfo", value: true })}
                className="p-1 flex items-center text-blue-500 rounded-full transition hover:bg-blue-100"
              >
                <FontAwesomeIcon icon={["far", "circle-question"]} />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-xs text-gray-500">{supportedStage && <p>{supportedStage.description}</p>}</div>
          {labelAlertKey && (
            <div
              className={clsx(
                "mr-8 text-xs font-medium",
                labelAlert?.severity === "warning" && "text-orange-500",
                labelAlert?.severity === "error" && "text-red-500",
              )}
            >
              {labelAlert?.message}
            </div>
          )}
        </div>
      </div>
      <ScrollArea type="auto" classNames={classes}>
        <StageSettings />
      </ScrollArea>
    </div>
  );
}

const useScrollAreaStyles = createStyles(() => ({
  root: { flex: 1 },
  viewport: {
    "& > div": { height: "100%" },
  },
}));

function AddStageHint() {
  const setElementToHighlight = useStoreActions((actions) => actions.layout.setElementToHighlight);
  return (
    <div className="h-full flex flex-col items-center justify-center gap-5 bg-white rounded-md shadow">
      <div className="flex items-center gap-3 text-lg text-blue-500">
        <FontAwesomeIcon icon={["far", "circle-question"]} />
        <p className="font-medium">To learn how to add stages to your grading pipeline:</p>
      </div>
      <Button
        icon={<FontAwesomeIcon icon={["fas", "compass"]} />}
        onClick={() => {
          setElementToHighlight("addStageTutorial");
        }}
        className="border border-cse-600 text-cse-600 text-lg hover:bg-blue-100 active:bg-blue-200"
      >
        Start Tutorial
      </Button>
    </div>
  );
}

function NoStageSelected() {
  return (
    <div className="h-full px-5 flex flex-col gap-6 items-center justify-center bg-white rounded-md shadow">
      <div className="flex items-center gap-3 text-lg text-blue-500">
        <FontAwesomeIcon icon={["far", "circle-question"]} />
        <p className="font-medium">To configure a stage, click the stage block in the pipeline editor.</p>
      </div>
      <div className="overflow-hidden">
        <Image
          src="/assets/gui_editor_select_stage.svg"
          alt="pipeline editor demo"
          width={300}
          height={150}
          className="rounded-xl"
        />
      </div>
    </div>
  );
}

export default StageSettings;
