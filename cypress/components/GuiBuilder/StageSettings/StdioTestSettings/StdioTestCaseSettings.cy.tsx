import { StdioTestCaseSettings } from "@/components/GuiBuilder/StageSettings/StdioTestSettings";
import { defaultTestCase } from "@/constants/GuiBuilder/defaults";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { GuiBuilderModel } from "@/store/GuiBuilder";
import { StdioTest, StdioTestRaw, TestCaseRaw, Valgrind } from "@/types/GuiBuilder";
import { createStore, Store } from "easy-peasy";
import { getModelWithStdioTestStage } from "./utils";

const stdioTest: StdioTest = {
  diff_ignore_flags: [],
  additional_packages: [],
  additional_pip_packages: [],
  testCases: [{ ...defaultTestCase, id: 1 }],
};

/**
 * Obtain the current `StdioTest` config from the store and converts it to a raw config.
 */
const getConfigRawFromStore = (store: Store<GuiBuilderModel>): StdioTestRaw => {
  const configActual = store.getState().config.editingConfig.stageData["stage-0"].config as StdioTest;
  const configActualRaw = supportedStages.StdioTest.configToRaw!(configActual) as StdioTestRaw;
  return configActualRaw;
};

describe("GuiBuilder: <StdioTestCaseSettings />", () => {
  beforeEach(() => {
    cy.viewport(800, 800);
  });

  it("sets a single StdioTest test case with Valgrind override", () => {
    const valgrind: Valgrind = {
      enabled: true,
      checksFilter: [],
      visibility: "ALWAYS_VISIBLE",
    };
    const model = getModelWithStdioTestStage(stdioTest, valgrind);
    const store = createStore(model);
    cy.mountWithStore(store, <StdioTestCaseSettings caseId={1} closeModal={() => {}} setView={() => {}} />);

    // Report
    cy.get("#score").type("1");
    cy.clickSelectInput("#visibility", "Visible after grading");
    cy.clickMultiSelectInput("#hide_from_report", ["Standard input"]);

    // Input/Output
    cy.get("#file").type("a.out");
    cy.get("#args").type("1");
    cy.clickSelectInput("#_stdinInputMode", "From helper file");
    cy.get("#file_stdin").type("1.txt");
    cy.clickSelectInput("#_expectedInputMode", "By text input");
    cy.get(".monaco-editor", { timeout: 8000 }).first().type("hi");

    // Valgrind
    cy.get("#_valgrindOverride").click();
    cy.get("#valgrind-score").type("5");
    cy.clickSelectInput("#valgrind-visibility", "Always visible");
    cy.clickMultiSelectInput("#valgrind-checksFilter", ["All Valgrind errors", "Memory leaks"]);
    cy.get("#valgrind-args").type("-v");

    cy.then(() => {
      const { testCases: testCasesActual } = getConfigRawFromStore(store);
      const testCasesExpected: TestCaseRaw[] = [
        {
          id: 1,
          file: "a.out",
          visibility: "VISIBLE_AFTER_GRADING",
          args: ["1"],
          stdin: undefined,
          file_stdin: "1.txt",
          expected: "hi",
          file_expected: undefined,
          hide_from_report: ["STDIN"],
          score: 1,
          valgrind: {
            enabled: true,
            score: 5,
            visibility: "ALWAYS_VISIBLE",
            checksFilter: ["Leak_*"],
            args: ["-v"],
          },
        },
      ];
      expect(testCasesActual).to.deep.equal(testCasesExpected);
    });
  });

  it("handles the editing of test case ID", () => {
    const stdioTest: StdioTest = {
      diff_ignore_flags: [],
      additional_packages: [],
      additional_pip_packages: [],
      testCases: [
        { ...defaultTestCase, id: 1 },
        { ...defaultTestCase, id: 2 },
      ],
    };
    const setViewMock = cy.stub().as("setView");

    const model = getModelWithStdioTestStage(stdioTest);
    const store = createStore(model);
    cy.mountWithStore(store, <StdioTestCaseSettings caseId={1} closeModal={() => {}} setView={setViewMock} />);

    cy.get('button[data-cy="edit-id"]').click();

    // Missing ID
    cy.get("#id").clear();
    cy.get('[data-cy="id-error-gt-1"]').should("be.visible");
    cy.get('button[title="Save new ID"]').should("be.disabled");

    // ID < 1
    cy.get("#id").type("0");
    cy.get('[data-cy="id-error-gt-1"]').should("be.visible");
    cy.get('button[title="Save new ID"]').should("be.disabled");

    // ID already exists
    cy.get("#id").clear().type("2");
    cy.get('[data-cy="id-error-taken"]').should("be.visible");
    cy.get('button[title="Save new ID"]').should("be.disabled");

    // Saves valid ID
    cy.get("#id").clear().type("3");
    cy.get('button[title="Save new ID"]').click();
    cy.get("@setView").should("be.calledWith", 3);
    cy.then(() => {
      const config = store.getState().config.editingConfig.stageData["stage-0"].config as StdioTest;
      expect(config.testCases[0].id).to.equal(3);
    });

    // The final UI would be blank because we're rendering `StdioTestCaseSettings` with prop `caseId={1}`.
    // However, we updated the ID of test case #1 to 3, so test case #1 no longer exists.
  });
});
