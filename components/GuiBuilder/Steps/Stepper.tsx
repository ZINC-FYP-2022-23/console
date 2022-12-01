import { createStyles, Stepper as StepperMantine } from "@mantine/core";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
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
    "&:active": {
      backgroundColor: "#93c5fd",
    },
    "&[data-progress]": {
      backgroundColor: "#bfdbfe",
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
  const setStep = useStoreActions((actions) => actions.setStep);

  return (
    <StepperMantine
      active={step}
      onStepClick={(stepIndex) => setStep(guiBuilderSteps[stepIndex].slug)}
      iconSize={36}
      orientation="horizontal"
      classNames={classes}
      className={className}
    >
      {guiBuilderSteps.map((step, index) => {
        const iconBlue = <div className="text-cse-700">{step.icon}</div>;
        return <StepperMantine.Step key={index} label={step.label} icon={iconBlue} completedIcon={step.icon} />;
      })}
    </StepperMantine>
  );
}

export default memo(Stepper);
