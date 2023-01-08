/**
 * @file Common input styles for styling Mantine input components.
 */

import { CSSObject, MantineTheme } from "@mantine/core";

/**
 * Base styles for the wrapper of an input box. It is roughly similar to its Tailwind counterpart.
 * @param addErrorStyles Whether to add styles for the error state. Requires the root Mantine component
 * to have a `data-alert-level: "warning" | "error"` attribute.
 */
export const getInputBoxWrapperStyles = (theme: MantineTheme, addErrorStyles = false): CSSObject => ({
  height: "auto",
  borderColor: theme.colors.gray[4],
  borderRadius: 6,
  boxShadow: "rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  transitionDuration: "150ms",
  transitionProperty: "border-color, box-shadow",
  "&:focus": {
    borderColor: "#93c5fd",
    boxShadow: "0 0 0 3px #dbeafe",
  },
  "&::placeholder": {
    color: "#9ca3af",
  },
  ...(addErrorStyles && {
    "&[data-alert-level=error]": {
      borderColor: theme.colors.red[6],
      "&:focus": {
        boxShadow: `0 0 0 3px ${theme.colors.red[1]}`,
      },
    },
    "&[data-alert-level=warning]": {
      borderColor: theme.colors.orange[6],
      "&:focus": {
        boxShadow: `0 0 0 3px ${theme.colors.orange[1]}`,
      },
    },
  }),
});
