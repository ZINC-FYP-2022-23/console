import { createStyles, Textarea as MantineTextarea, TextareaProps as MantineTextareaProps } from "@mantine/core";
import { getInputBoxWrapperStyles } from "./mantineStyles";

interface TextareaProps extends MantineTextareaProps {
  /** Whether the textarea sizes automatically (default is `true`). */
  autosize?: boolean;
  /** Whether to use monospace in the textarea. */
  monospace?: boolean;
}

/**
 * A textarea that can autosize by default.
 */
function Textarea({ autosize = true, monospace = false, ...props }: TextareaProps) {
  const useStyles = createStyles((theme) => ({
    root: {
      // A trick to increase specificity of styles so they don't get overridden by Tailwind default styles
      "& textarea": {
        ...getInputBoxWrapperStyles(theme),
        padding: "0.5rem 0.75rem",
        ...(monospace && { fontFamily: theme.fontFamilyMonospace }),
      },
    },
  }));
  const { classes } = useStyles();

  return <MantineTextarea autosize={autosize} minRows={autosize ? 1 : undefined} classNames={classes} {...props} />;
}

export default Textarea;
