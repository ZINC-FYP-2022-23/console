import Button from "@components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createStyles, Modal, ScrollArea } from "@mantine/core";
import { useSelectedStageConfig } from "@state/GuiBuilder/Hooks";
import { StdioTest } from "@types";
import { useState } from "react";
import StdioTestStageSettings from "./StdioTestStageSettings";

function StdioTestSettings() {
  const { classes } = useStyles();
  const [config] = useSelectedStageConfig<StdioTest>();

  const [modalOpened, setModalOpened] = useState(false);

  return (
    <>
      <div className="h-full py-20 flex flex-col items-center gap-5">
        <p className="text-lg text-gray-600">To edit stage settings and test cases, press the button below.</p>
        <Button
          className="bg-cse-700 text-white text-lg hover:bg-cse-500"
          icon={<FontAwesomeIcon icon={["far", "arrow-up-right-from-square"]} />}
          onClick={() => setModalOpened(true)}
        >
          Edit Stage Configuration
        </Button>
      </div>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Standard I/O Test Configuration"
        overflow="inside"
        size="70%"
        transitionDuration={200}
        classNames={classes}
      >
        <div className="flex h-full">
          <div className="w-44 h-full flex flex-col bg-gray-100 rounded-lg space-y-3">
            <div className="p-3 flex flex-col gap-2">
              <Button
                icon={<FontAwesomeIcon icon={["fas", "gear"]} />}
                className="!justify-start bg-cse-700 text-white hover:bg-cse-500"
              >
                Settings
              </Button>
              <Button
                icon={<FontAwesomeIcon icon={["fas", "add"]} />}
                className="!justify-start bg-green-600 text-white hover:bg-green-700"
              >
                Add Test
              </Button>
            </div>
            <ScrollArea type="auto" className="px-3">
              <div className="flex flex-col gap-1">
                {config.testCases.map((test) => (
                  <TestCaseButton key={test.id} id={test.id} />
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex-1 pl-5 py-2 overflow-y-auto">
            <StdioTestStageSettings />
          </div>
        </div>
      </Modal>
    </>
  );
}

const useStyles = createStyles((theme) => ({
  inner: {
    padding: "60px 16px",
  },
  modal: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    color: theme.colors.blue[4],
    fontSize: theme.fontSizes.xl,
    fontWeight: 600,
  },
  body: {
    height: "100%",
  },
}));

interface TestCaseButtonProps {
  id: number;
}

function TestCaseButton({ id }: TestCaseButtonProps) {
  return <Button className="!px-3 !justify-start text-black hover:bg-blue-200 hover:text-blue-900">Test #{id}</Button>;
}

export default StdioTestSettings;
