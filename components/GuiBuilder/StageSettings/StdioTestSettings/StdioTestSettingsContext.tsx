import { createContext, useContext } from "react";

interface StdioTestSettingsContextType {
  /** Callback to close the parent modal. */
  closeModal: () => void;
  /**
   * Which view to show in the "Test Cases" tab panel. Either:
   * - "table" = Table view
   * - `number` = Test case ID that is being edited
   */
  testCaseView: "table" | number;
  /**
   * Sets the view to show in the "Test Cases" tab panel.
   * @param view `"table"` = Table view, `number` = Test case ID that is being edited
   */
  setTestCaseView: (view: "table" | number) => void;
}

const StdioTestSettingsContext = createContext<StdioTestSettingsContextType | null>(null);
StdioTestSettingsContext.displayName = "StdioTestSettingsContext";

export function useStdioTestSettingsContext() {
  const context = useContext(StdioTestSettingsContext);
  if (context === null) {
    const error = new Error("useStdioTestSettingsContext must be inside a <StdioTestSettings.Provider /> component.");
    throw error;
  }
  return context;
}

export default StdioTestSettingsContext;
