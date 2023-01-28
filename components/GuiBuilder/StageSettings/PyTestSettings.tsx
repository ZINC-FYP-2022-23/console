import Button from "@/components/Button";
import { TagsInput, Textarea } from "@/components/Input";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea, Tooltip } from "@mantine/core";
import { FocusEventHandler, useState } from "react";
import { StageConfigModal } from "./common";

function PyTestSettings() {
  const [config, setConfig] = useSelectedStageConfig("PyTest");

  const [modalOpened, setModalOpened] = useState(false);

  if (!config) return null;

  /** If user has typed something in the `additional_pip_packages` input, add it to the list of tags. */
  const onTagInputBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value.trim();
    if (value === "") return;
    if (!config.additional_pip_packages.includes(value)) {
      setConfig({ ...config, additional_pip_packages: [...config.additional_pip_packages, value] });
      e.target.value = "";
    }
  };

  return (
    <>
      <div className="h-full py-20 flex flex-col items-center gap-5">
        <p className="text-lg text-gray-500">To edit the stage settings, press the button below.</p>
        <Button
          className="bg-cse-700 text-white text-lg hover:bg-cse-500"
          icon={<FontAwesomeIcon icon={["far", "arrow-up-right-from-square"]} />}
          onClick={() => setModalOpened(true)}
        >
          Edit Stage Configuration
        </Button>
      </div>
      <StageConfigModal opened={modalOpened} onClose={() => setModalOpened(false)} title="PyTest Stage Configuration">
        <ScrollArea type="auto" offsetScrollbars className="pr-1 h-full">
          <div className="pt-1 space-y-4">
            <div className="flex gap-3">
              <div className="mt-2 flex-1">
                <div className="flex items-center gap-3">
                  <label htmlFor="args">
                    <code>pytest</code> command-line options
                  </label>
                  <Tooltip label="Documentation on PyTest command-line options">
                    <a
                      href="https://docs.pytest.org/en/latest/reference/reference.html#command-line-flags"
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 flex items-center text-blue-500 rounded-full transition hover:bg-blue-100"
                    >
                      <FontAwesomeIcon icon={["far", "arrow-up-right-from-square"]} />
                    </a>
                  </Tooltip>
                </div>
              </div>
              <Textarea
                id="args"
                value={config.args}
                onChange={(e) => setConfig({ ...config, args: e.target.value })}
                placeholder="e.g. --maxfail=2"
                monospace
                styles={{ root: { flex: 2 } }}
              />
            </div>
            <div className="flex gap-3">
              <div className="mt-2 flex-1">
                <label htmlFor="additional_pip_packages">Pip package dependencies</label>
                <p className="text-gray-500 text-xs">Required by the submission and your test suite</p>
              </div>
              <TagsInput
                name="additional_pip_packages"
                value={config.additional_pip_packages}
                onChange={(tags) => setConfig({ ...config, additional_pip_packages: tags })}
                onBlur={onTagInputBlur}
                placeHolder={config.additional_pip_packages.length === 0 ? "e.g. numpy" : ""}
                className="flex-[2] font-mono text-sm"
              />
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-2 font-semibold text-lg">Scoring Policy</p>
          </div>
        </ScrollArea>
      </StageConfigModal>
    </>
  );
}

export default PyTestSettings;
