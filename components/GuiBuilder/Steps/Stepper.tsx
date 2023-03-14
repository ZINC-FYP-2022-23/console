import { useQueryParameters } from "@/hooks/GuiBuilder";
import { useStoreState } from "@/store/GuiBuilder";
import { createStyles, Stepper as StepperMantine } from "@mantine/core";
import { memo } from "react";
import guiBuilderSteps from "./GuiBuilderSteps";

const useStyles = createStyles((theme) => ({
  step: {
    padding: "6px 8px",
    borderRadius: theme.radius.md,
    transition: "background-color 150ms ease",
    "&[data-completed]": {
      "&:hover": {
        backgroundColor: "#bfdbfe",
      },
      "&:active": {
        backgroundColor: "#93c5fd",
      },
    },
    "&[data-progress]": {
      backgroundColor: "#bfdbfe",
    },
  },
  separator: {
    backgroundColor: theme.colors.gray[5],
    marginLeft: 6,
    marginRight: 6,
  },
  stepLabel: {
    color: theme.colors.gray[6],
    lineHeight: 1.1,
    "button[data-completed] &, button[data-progress] &": {
      color: theme.colors.blue[8],
    },
  },
}));

interface StepperProps {
  /** Classes to apply to root of Stepper. */
  className?: string;
}

/**
 * A stepper for navigating between different steps in the GUI Assignment Builder.
 */
function Stepper({ className = "" }: StepperProps) {
  const { classes } = useStyles();
  const step = useStoreState((state) => state.layout.step);
  const stageData = useStoreState((state) => state.config.editingConfig.stageData);

  const { updateStep } = useQueryParameters();

  const stepsToShow = guiBuilderSteps.filter((step) => {
    return step.showStep === undefined || step.showStep(stageData);
  });
  const stepIndex = stepsToShow.findIndex((s) => s.slug === step);

  return (
    <StepperMantine
      active={stepIndex}
      onStepClick={(stepIndex) => updateStep(stepsToShow[stepIndex].slug)}
      iconSize={32}
      orientation="horizontal"
      classNames={classes}
      className={className}
    >
      {stepsToShow.map((step, index) => {
        const icon = <div className="text-sm">{step.icon}</div>;
        return (
          <StepperMantine.Step
            key={index}
            allowStepSelect={stepIndex > index} // Only allow select previous steps
            label={step.label}
            icon={icon}
            completedIcon={step.icon}
          />
        );
      })}
    </StepperMantine>
  );
}

export default memo(Stepper);
