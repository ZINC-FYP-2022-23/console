import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { createStyles, Stepper as StepperMantine } from "@mantine/core";
import { memo } from "react";
import guiBuilderSteps from "./GuiBuilderSteps";

const useStyles = createStyles((theme) => ({
  step: {
    padding: "6px 8px",
    borderRadius: theme.radius.md,
    transition: "background-color 150ms ease",
    "&:hover": {
      backgroundColor: "#bfdbfe",
    },
    "&.locked:hover": {
      backgroundColor: theme.colors.gray[4],
    },
    "&:active": {
      backgroundColor: "#93c5fd",
    },
    "&.locked:active": {
      backgroundColor: theme.colors.gray[5],
    },
    "&[data-progress]": {
      backgroundColor: "#bfdbfe",
      "&.locked": {
        backgroundColor: theme.colors.gray[4],
      },
    },
  },
  separator: {
    backgroundColor: "#b0b8c5",
    marginLeft: 6,
    marginRight: 6,
  },
  stepLabel: {
    color: theme.colors.blue[8],
    lineHeight: 1.1,
    "button.locked &": {
      color: theme.colors.gray[6],
    },
  },
  stepIcon: {
    "button.locked &": {
      backgroundColor: theme.colors.gray[2],
      borderColor: theme.colors.gray[2],
    },
    "button.locked &[data-completed]": {
      backgroundColor: theme.colors.gray[5],
      borderColor: theme.colors.gray[5],
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
  const configId = useStoreState((state) => state.config.configId);
  const stepIndex = useStoreState((state) => state.layout.stepIndex);
  const setStep = useStoreActions((actions) => actions.layout.setStep);

  return (
    <StepperMantine
      active={stepIndex}
      onStepClick={(stepIndex) => setStep(guiBuilderSteps[stepIndex].slug)}
      iconSize={36}
      orientation="horizontal"
      classNames={classes}
      className={className}
    >
      {guiBuilderSteps.map((step, index) => {
        const isLocked = configId === null && !step.lockedWhenNew;
        const iconBlue = <div className={isLocked ? "text-gray-500" : "text-cse-700"}>{step.icon}</div>;
        return (
          <StepperMantine.Step
            key={index}
            label={step.label}
            icon={iconBlue}
            completedIcon={step.icon}
            className={isLocked ? "locked" : ""}
          />
        );
      })}
    </StepperMantine>
  );
}

export default memo(Stepper);
