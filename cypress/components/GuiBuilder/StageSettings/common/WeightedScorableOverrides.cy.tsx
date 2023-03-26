import { PredicateData, WeightedScorableOverrides } from "@/components/GuiBuilder/StageSettings/common";
import { defaultJoinPolicy, defaultPredicate } from "@/constants/GuiBuilder/defaults";
import { Override, PredicateBoolean, PredicateNumber, Predicates, PredicateString } from "@/types/GuiBuilder";

/** An example implementation of {@link Predicates} that contains all types of predicates. */
type TestPredicates = {
  bool?: PredicateBoolean;
  num?: PredicateNumber;
  str?: PredicateString;
};

/** Data of what predicate fields the user can add. */
const testPredicatesData: PredicateData<TestPredicates>[] = [
  {
    key: "bool",
    label: "Boolean Field",
    type: "boolean",
  },
  {
    key: "num",
    label: "Number Field",
    type: "number",
  },
  {
    key: "str",
    label: "String Field",
    type: "string",
  },
];

describe("GuiBuilder: <WeightedScorableOverrides />", () => {
  beforeEach(() => {
    cy.viewport(800, 500);
  });

  it("deletes the override when the delete score override button is clicked", () => {
    const initialOverrides: Override<TestPredicates>[] = [
      {
        _uuid: "mock-uuid-1",
        score: 2,
        num: { op: "EQ", value: 1 },
      },
      {
        _uuid: "mock-uuid-2",
        score: 3,
        bool: { op: "EQ", value: true },
      },
    ];
    const setOverridesSpy = cy.spy().as("setOverridesSpy");

    cy.mount(
      <WeightedScorableOverrides
        data={testPredicatesData}
        overrides={initialOverrides}
        setOverrides={setOverridesSpy}
      />,
    );
    cy.get('button[title="Delete score override" i]').first().click();
    cy.get("@setOverridesSpy").should("be.calledWith", [initialOverrides[1]]);
  });

  describe("Add condition button", () => {
    it("adds a new predicate row when clicked", () => {
      const initialOverride: Override<TestPredicates> = {
        _uuid: "mock-uuid-1",
        score: 2,
        num: { op: "EQ", value: 1 },
      };
      const setOverridesSpy = cy.spy().as("setOverridesSpy");

      cy.mount(
        <WeightedScorableOverrides
          data={testPredicatesData}
          overrides={[initialOverride]}
          setOverrides={setOverridesSpy}
        />,
      );
      cy.get("button")
        .contains(/add condition/i)
        .should("be.visible")
        .click();
      cy.get("@setOverridesSpy").should("be.calledWith", [
        {
          ...initialOverride,
          joinPolicy: defaultJoinPolicy,
          bool: { op: defaultPredicate.op, value: defaultPredicate.value.boolean },
        },
      ]);
    });

    it("is hidden if all predicate fields are already added", () => {
      const initialOverrides: Override<TestPredicates>[] = [
        {
          _uuid: "mock-uuid-1",
          score: 2,
          bool: { op: "EQ", value: true },
          num: { op: "EQ", value: 1 },
          str: { op: "EQ", value: "foo" },
        },
      ];

      cy.mount(<WeightedScorableOverrides data={testPredicatesData} overrides={initialOverrides} />);
      cy.get("button")
        .contains(/add condition/i)
        .should("not.exist");
    });
  });

  describe("Delete condition button", () => {
    it("is shown only when there are >2 predicate rows", () => {
      const testPredicateOverride: Override<TestPredicates> = {
        _uuid: "mock-uuid-1",
        score: 2,
      };
      // const getDeleteConditionButtons = () => screen.queryAllByRole("button", { name: /delete condition/i });

      // 0 predicate
      cy.mount(<WeightedScorableOverrides data={testPredicatesData} overrides={[testPredicateOverride]} />);
      cy.get("button[title='Delete condition' i]").should("not.exist");

      // 1 predicate
      cy.mount(
        <WeightedScorableOverrides
          data={testPredicatesData}
          overrides={[{ ...testPredicateOverride, bool: { op: "EQ", value: true } }]}
        />,
      );
      cy.get("button[title='Delete condition' i]").should("not.exist");

      // 2 predicates
      cy.mount(
        <WeightedScorableOverrides
          data={testPredicatesData}
          overrides={[
            {
              ...testPredicateOverride,
              bool: { op: "EQ", value: true },
              num: { op: "EQ", value: 1 },
            },
          ]}
        />,
      );
      cy.get("button[title='Delete condition' i]").should("have.length", 2);
    });

    it("deletes the predicate row when clicked", () => {
      const expectedOverride: Override<TestPredicates> = {
        _uuid: "mock-uuid-1",
        score: 2,
        num: { op: "EQ", value: 1 },
      };
      const initialOverride: Override<TestPredicates> = {
        ...expectedOverride,
        bool: { op: "EQ", value: true },
      };
      const setOverridesSpy = cy.spy().as("setOverridesSpy");

      cy.mount(
        <WeightedScorableOverrides
          data={testPredicatesData}
          overrides={[initialOverride]}
          setOverrides={setOverridesSpy}
        />,
      );
      cy.get("button[title='Delete condition' i]").first().click();
      cy.get("@setOverridesSpy").should("be.calledWith", [expectedOverride]);
    });
  });
});
