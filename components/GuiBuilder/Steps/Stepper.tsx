import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { createStyles, Stepper as StepperMantine } from "@mantine/core";
import { memo } from "react";
import guiBuilderSteps from "./GuiBuilderSteps";

const useStyles = createStyles((theme) => ({
  step: {
    padding: "6px 8px",
    borderRadius: theme.radius.md,
    transition: "background-color 150ms ease",
    "&[data-completed]:not(.locked)": {
      "&:hover": {
        backgroundColor: "#bfdbfe",
      },
      "&:active": {
        backgroundColor: "#93c5fd",
      },
    },
    // Selected step
    "&[data-progress]": {
      backgroundColor: "#bfdbfe",
      "&.locked": {
        backgroundColor: theme.colors.gray[4],
      },
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
    "button[data-completed].locked &, button[data-progress].locked &": {
      color: theme.colors.gray[6],
    },
  },
  stepIcon: {
    "button.locked &": {
      backgroundColor: theme.colors.gray[2],
      borderColor: theme.colors.gray[2],
    },
    "button[data-completed].locked &": {
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
      iconSize={32}
      orientation="horizontal"
      classNames={classes}
      className={className}
    >
      {guiBuilderSteps.map((step, index) => {
        const isLockedWhenNew = configId === null && !step.lockedWhenNew;
        const icon = <div className="text-sm">{step.icon}</div>;
        return (
          <StepperMantine.Step
            key={index}
            allowStepSelect={stepIndex > index} // Only allow select previous steps
            label={step.label}
            icon={icon}
            completedIcon={step.icon}
            className={isLockedWhenNew ? "locked" : ""}
          />
        );
      })}
    </StepperMantine>
  );
}

export default memo(Stepper);
