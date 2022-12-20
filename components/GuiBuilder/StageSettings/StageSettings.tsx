import supportedStages, { SupportedStage } from "@constants/Config/supportedStages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mantine/core";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import UnsupportedStage from "./UnsupportedStage";

type StageLabelAlert = Record<
  "duplicateName" | "hasColon" | "discouragedChars",
  { severity: "warning" | "error"; message: React.ReactNode }
>;

const labelAlerts: StageLabelAlert = {
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
};

/**
 * @returns class names related to the stage label alert based on the alert's severity.
 */
const getLabelAlertStyles = (alert: keyof StageLabelAlert | null, styles: { warning: string; error: string }) => {
  return alert === null ? "" : styles[labelAlerts[alert].severity];
};

/**
 * Settings panel for an individual stage in the pipeline.
 */
function StageSettings() {
  const selectedStage = useStoreState((state) => state.selectedStage);
  const hasDuplicateNonEmptyLabels = useStoreState((state) => state.hasDuplicateNonEmptyLabels);
  const updateSelectedStage = useStoreActions((actions) => actions.updateSelectedStage);
  const setModal = useStoreActions((actions) => actions.setModal);
  const [labelAlert, setLabelAlert] = useState<keyof StageLabelAlert | null>(null);

  const validateStageLabel = useCallback(
    (label: string) => {
      if (label.includes(":")) {
        setLabelAlert("hasColon");
      } else if (label.match(/[^a-zA-Z0-9]/)) {
        setLabelAlert("discouragedChars");
      } else if (hasDuplicateNonEmptyLabels) {
        setLabelAlert("duplicateName");
      } else {
        setLabelAlert(null);
      }
    },
    [hasDuplicateNonEmptyLabels],
  );

  useEffect(() => {
    if (selectedStage) {
      validateStageLabel(selectedStage.label);
    }
  }, [selectedStage, validateStageLabel]);

  if (selectedStage === null) {
    return <NoStageSelected />;
  }

  const stageName = selectedStage.name;
  const supportedStage: SupportedStage | undefined = supportedStages[stageName];
  const StageSettings = supportedStage?.stageSettings ?? UnsupportedStage;

  return (
    <div className="h-full flex flex-col bg-white rounded-md shadow overflow-y-hidden">
      <div className="px-3 py-2 bg-blue-50 border-b border-gray-300">
        <div className="flex justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">{supportedStage?.label ?? stageName}</h2>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={["fas", "tag"]} className="mr-1 text-gray-500" />
            <p className="text-gray-500 text-sm font-medium">Label:</p>
            <input
              type="text"
              value={selectedStage.label}
              onChange={(event) => {
                const value = event.target.value;
                validateStageLabel(value);
                updateSelectedStage({ path: "label", value });
              }}
              className={`w-36 px-2 py-1 mx-2 border border-gray-300 text-sm leading-4 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300 transition ${getLabelAlertStyles(
                labelAlert,
                {
                  warning: "border-orange-500 focus:border-orange-500 focus:ring-orange-100",
                  error: "border-red-500 focus:border-red-500 focus:ring-red-100",
                },
              )}`}
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
          <div
            className={`mr-8 text-xs font-medium ${getLabelAlertStyles(labelAlert, {
              warning: "text-orange-500",
              error: "text-red-500",
            })}`}
          >
            {labelAlert && labelAlerts[labelAlert].message}
          </div>
        </div>
      </div>
      <div className="overflow-y-auto">
        <StageSettings />
      </div>
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
