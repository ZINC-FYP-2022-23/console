import { StdioTestCasesTable } from "@/components/GuiBuilder/StageSettings/StdioTestSettings";
import { StdioTest, TestCase, Valgrind } from "@/types/GuiBuilder";
import { createStore } from "easy-peasy";
import { getModelWithStdioTestStage } from "./utils";

const testCases: TestCase[] = [
  {
    id: 1,
    file: "a.out",
    visibility: "ALWAYS_VISIBLE",
    _stdinInputMode: "none",
    _expectedInputMode: "none",
    score: 1,
    _valgrindOverride: false,
  },
  {
    id: 2,
    file: "a.out",
    visibility: "ALWAYS_HIDDEN",
    _stdinInputMode: "none",
    _expectedInputMode: "none",
    score: 2,
    _valgrindOverride: true,
    valgrind: {
      enabled: true,
      checksFilter: [],
      visibility: "ALWAYS_VISIBLE",
    },
  },
  {
    id: 3,
    file: "a.out",
    visibility: "VISIBLE_AFTER_GRADING",
    _stdinInputMode: "none",
    _expectedInputMode: "none",
    score: 3,
    _valgrindOverride: true,
    valgrind: {
      enabled: false,
      checksFilter: [],
      visibility: "ALWAYS_VISIBLE",
    },
  },
];

const stdioTest: StdioTest = {
  additional_packages: [],
  additional_pip_packages: [],
  diff_ignore_flags: [],
  testCases,
};

describe("GuiBuilder: <StdioTestCasesTable />", () => {
  beforeEach(() => {
    cy.viewport(900, 400);
  });

  it("renders a table of StdioTest test cases", () => {
    const onDuplicateSpy = cy.spy().as("onDuplicate");
    const onDeleteSpy = cy.spy().as("onDelete");
    const onVisitSpy = cy.spy().as("onVisit");

    const model = getModelWithStdioTestStage(stdioTest);
    const store = createStore(model);
    cy.mountWithStore(
      store,
      <StdioTestCasesTable
        testCases={testCases}
        onDuplicate={onDuplicateSpy}
        onDelete={onDeleteSpy}
        onVisit={onVisitSpy}
      />,
    );

    const expectedCellData = [
      { id: "1", score: "1", visibility: "Always Visible" },
      { id: "2", score: "2", visibility: "Always Hidden" },
      { id: "3", score: "3", visibility: "Visible After Grading" },
    ];
    expectedCellData.forEach((cellData, index) => {
      Object.entries(cellData).forEach(([key, value]) => {
        cy.get(`[data-cy="${index}_${key}"]`).should("have.text", value);
      });
    });

    cy.get('button[title="Duplicate test case #2"]').click();
    cy.get("@onDuplicate").should("have.been.calledWith", 2);

    cy.get('button[title="Delete test case #2"]').click();
    cy.get("@onDelete").should("have.been.calledWith", 2);

    cy.get('button[title="Edit test case #2"]').click();
    cy.get("@onVisit").should("have.been.calledWith", 2);
  });

  describe("Run Valgrind column", () => {
    const expectRunValgrindCellToBe = (rowIndex: number, value: boolean) => {
      const ariaLabel = value ? "Yes" : "No";
      cy.get(`[data-cy="${rowIndex}_runValgrind"] svg`).invoke("attr", "aria-label").should("eq", ariaLabel);
    };

    it("always show 'No' when the pipeline has no Valgrind stage", () => {
      const model = getModelWithStdioTestStage(stdioTest);
      const store = createStore(model);
      cy.mountWithStore(
        store,
        <StdioTestCasesTable testCases={testCases} onDuplicate={() => {}} onDelete={() => {}} onVisit={() => {}} />,
      );

      for (let i = 0; i < testCases.length; i++) {
        expectRunValgrindCellToBe(i, false);
      }
    });

    it("computes the value when the pipeline has a Valgrind stage", () => {
      const valgrind: Valgrind = {
        enabled: true,
        checksFilter: [],
        visibility: "ALWAYS_VISIBLE",
      };
      const model = getModelWithStdioTestStage(stdioTest, valgrind);
      const store = createStore(model);
      cy.mountWithStore(
        store,
        <StdioTestCasesTable testCases={testCases} onDuplicate={() => {}} onDelete={() => {}} onVisit={() => {}} />,
      );

      // No Valgrind override -> Use `enabled` from Valgrind stage
      expectRunValgrindCellToBe(0, true);

      // The Valgrind override in the test case enabled Valgrind
      expectRunValgrindCellToBe(1, true);

      // The Valgrind override in the test case disabled Valgrind
      expectRunValgrindCellToBe(2, false);
    });
  });
});
