import ListInput from "@components/Input/ListInput";
import { createStyles, Accordion } from "@mantine/core";
import { useSelectedStageConfig, useStoreActions } from "@state/GuiBuilder/Hooks";
import { FileStructureValidation } from "@types";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

/** Styles for the {@link https://mantine.dev/core/accordion Mantine Accordion} component. */
const useStyles = createStyles(() => ({
  control: {
    padding: "8px 12px 8px 8px",
    ":hover": {
      backgroundColor: "transparent",
    },
  },
  label: {
    color: "#3b82f6",
    fontWeight: 600,
  },
  chevron: {
    marginRight: "8px",
  },
  content: {
    padding: "0px 12px 12px 40px",
    backgroundColor: "#ffffff",
  },
}));

function FileStructureValidation() {
  const [config, setConfig] = useSelectedStageConfig<FileStructureValidation>();
  const setStep = useStoreActions((actions) => actions.setStep);

  const [ignoredFiles, setIgnoredFiles] = useState<{ id: string; name: string }[]>(
    config.ignore_in_submission?.map((name) => ({ id: uuidv4(), name })) ?? [],
  );

  const updateIgnoredFiles = (files: { id: string; name: string }[]) => {
    setIgnoredFiles(files);
    setConfig({ ...config, ignore_in_submission: files.map((file) => file.name) });
  };

  return (
    <div className="p-3">
      <p className="mb-2">
        Files/directories to <span className="font-semibold">ignore</span> checking:
      </p>
      <ListInput>
        {ignoredFiles.map((file, index) => (
          <ListInput.Item
            key={file.id}
            index={index}
            placeholder="e.g. '*.out' or './examples/*'"
            value={file.name}
            onChange={(event) => {
              const newFiles = [...ignoredFiles];
              newFiles[index].name = event.target.value;
              updateIgnoredFiles(newFiles);
            }}
            onEnterKeyPressed={() => {
              const newFiles = [...ignoredFiles];
              newFiles.splice(index + 1, 0, { id: uuidv4(), name: "" });
              updateIgnoredFiles(newFiles);
            }}
            onDelete={() => {
              const newFiles = ignoredFiles.filter((f) => f.id !== file.id);
              updateIgnoredFiles(newFiles);
            }}
          />
        ))}
        <ListInput.AddButton
          onClick={() => {
            const newFiles = [...ignoredFiles, { id: uuidv4(), name: "" }];
            updateIgnoredFiles(newFiles);
          }}
        />
      </ListInput>
      <div className="mt-8 border-b border-gray-300" />
      <InfoAccordion title="How to specify what files/directories to ignore checking?">
        <div className="space-y-2">
          <p>There are 2 methods:</p>
          <p className="font-semibold">1. File/Directory Names</p>
          <div className="ml-1 space-y-1">
            <ul className="ml-6 list-disc">
              <li>
                All files/directories matching the name,{" "}
                <span className="font-semibold">regardless of its location</span>, will be ignored from checking. It
                does not care where the ignored files/directories are located in.
              </li>
              <li>
                Glob expressions (<code>*</code>) are accepted.
              </li>
              <li>
                No need to add leading or trailing slash (<code>/</code>).
              </li>
            </ul>
            <p>For example:</p>
            <ul className="ml-6 list-disc">
              <li>
                <code>main.cpp</code>: Matches any file/directory with the name <code>main.cpp</code>.
              </li>
              <li>
                <code>*.cpp</code>: Matches any file/directory ending in <code>.cpp</code>.
              </li>
            </ul>
          </div>
          <p className="font-semibold">2. Shell Pattern</p>
          <div className="ml-1 space-y-1">
            <ul className="ml-6 list-disc">
              <li>
                Use this to ignore files <span className="font-semibold">under a specific directory</span>.
              </li>
              <li>
                Refer{" "}
                <a
                  href="https://www.gnu.org/software/findutils/manual/html_node/find_html/Shell-Pattern-Matching.html"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-500"
                >
                  this page
                </a>{" "}
                for more details on shell pattern matching.
              </li>
              <li>
                To reference a path relative to the submission root, you must prepend <code>./</code> to the path.
              </li>
            </ul>
            <p>For example:</p>
            <ul className="ml-6 list-disc">
              <li>
                <code>./src/*</code>: Matches any files under <code>src</code> relative to the root of submission.
              </li>
              <li>
                <code>./src/main/*.java</code>: Matches all files starting with any path, containing{" "}
                <code>src/main</code> in its path component, and ending with <code>.java</code>.
              </li>
            </ul>
          </div>
        </div>
      </InfoAccordion>
      <InfoAccordion title="Default ignore list">
        <p>
          The Grader will <span className="font-semibold">always exclude</span> the following files/directories during
          file structure validation (no need to re-specify them in the above):
        </p>
        <ul className="ml-6 mt-1 list-disc font-mono">
          <li>*~</li>
          <li>.directory</li>
          <li>.DS_Store</li>
          <li>._*</li>
          <li>Thumbs.db</li>
          <li>Desktop.ini</li>
          <li>desktop.ini</li>
        </ul>
      </InfoAccordion>
      <InfoAccordion title="How to specify what files should students submit?">
        <div className="space-y-2">
          <p>To specify the file structure that this stage will validate students&apos; submissions against, go to:</p>
          <p>
            <button onClick={() => setStep(0)} className="underline text-blue-500">
              General Settings
            </button>{" "}
            &gt; Pipeline Settings &gt; Helper Files &gt; “Specify files that students should submit”
          </p>
        </div>
      </InfoAccordion>
    </div>
  );
}

interface InfoAccordionProps {
  title: string;
  children: React.ReactNode;
}

const InfoAccordion = ({ title, children }: InfoAccordionProps) => {
  const { classes } = useStyles();
  return (
    <Accordion chevronPosition="left" classNames={classes}>
      <Accordion.Item value={title}>
        <Accordion.Control>{title}</Accordion.Control>
        <Accordion.Panel>
          <div className="text-sm text-gray-600">{children}</div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default FileStructureValidation;
