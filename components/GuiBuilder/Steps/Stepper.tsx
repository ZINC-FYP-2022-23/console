import { createStyles, Stepper as StepperMantine } from "@mantine/core";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import defaultTheme from "tailwindcss/defaultTheme";
import guiBuilderSteps from "./GuiBuilderSteps";

const useStyles = createStyles(() => ({
  step: {
    padding: "6px 8px",
    borderRadius: 8,
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
  separatorActive: {
    backgroundColor: "#1b3663",
  },
  stepLabel: {
    color: "#1f2937",
    lineHeight: 1.1,
    fontFamily: `Inter var, ${defaultTheme.fontFamily.sans.join(", ")}`,
  },
  stepIcon: {
    "&[data-completed]": {
      backgroundColor: "#1b3663",
      borderColor: "#1b3663",
    },
    "&[data-progress]": {
      borderColor: "#1b3663",
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
  const setStep = useStoreActions((actions) => actions.setStep);

  return (
    <StepperMantine
      active={step}
      onStepClick={setStep}
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

export default Stepper;
