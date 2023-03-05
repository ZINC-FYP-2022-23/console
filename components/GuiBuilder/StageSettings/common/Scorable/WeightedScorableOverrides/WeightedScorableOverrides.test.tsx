import { defaultJoinPolicy, defaultPredicate } from "@/constants/GuiBuilder/defaults";
import { Override, PredicateBoolean, PredicateNumber, Predicates, PredicateString } from "@/types/GuiBuilder";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WeightedScorableOverrides, { PredicateData } from "./WeightedScorableOverrides";

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
  it("deletes the override when the delete score override button is clicked", async () => {
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
    const setOverridesMock = jest.fn();

    const { queryAllByRole } = render(
      <WeightedScorableOverrides
        data={testPredicatesData}
        overrides={initialOverrides}
        setOverrides={setOverridesMock}
      />,
    );
    const deleteOverrideButtons = queryAllByRole("button", { name: /delete score override/i });
    await userEvent.click(deleteOverrideButtons[0]);

    expect(setOverridesMock).toHaveBeenCalledWith([initialOverrides[1]]);
  });

  describe("Add condition button", () => {
    it("adds a new predicate row when clicked", async () => {
      const initialOverride: Override<TestPredicates> = {
        _uuid: "mock-uuid-1",
        score: 2,
        num: { op: "EQ", value: 1 },
      };
      const setOverridesMock = jest.fn();

      const { getByRole } = render(
        <WeightedScorableOverrides
          data={testPredicatesData}
          overrides={[initialOverride]}
          setOverrides={setOverridesMock}
        />,
      );
      const addConditionButton = getByRole("button", { name: /add condition/i });
      expect(addConditionButton).toBeInTheDocument();

      await userEvent.click(addConditionButton);
      expect(setOverridesMock).toHaveBeenCalledWith([
        {
          ...initialOverride,
          joinPolicy: defaultJoinPolicy,
          bool: { op: defaultPredicate.op, value: defaultPredicate.value.boolean },
        },
      ]);
    });

    it("is hidden if all predicate fields are already added", async () => {
      const initialOverrides: Override<TestPredicates>[] = [
        {
          _uuid: "mock-uuid-1",
          score: 2,
          bool: { op: "EQ", value: true },
          num: { op: "EQ", value: 1 },
          str: { op: "EQ", value: "foo" },
        },
      ];
      const { queryByRole } = render(
        <WeightedScorableOverrides data={testPredicatesData} overrides={initialOverrides} />,
      );
      const addConditionButton = queryByRole("button", { name: /add condition/i });

      expect(addConditionButton).toBeNull();
    });
  });

  describe("Delete condition button", () => {
    it("is shown only when there are >2 predicate rows", () => {
      const testPredicateOverride: Override<TestPredicates> = {
        _uuid: "mock-uuid-1",
        score: 2,
      };
      const getDeleteConditionButtons = () => screen.queryAllByRole("button", { name: /delete condition/i });

      // 0 predicate
      render(<WeightedScorableOverrides data={testPredicatesData} overrides={[testPredicateOverride]} />);
      expect(getDeleteConditionButtons()).toEqual([]);

      // 1 predicate
      render(
        <WeightedScorableOverrides
          data={testPredicatesData}
          overrides={[{ ...testPredicateOverride, bool: { op: "EQ", value: true } }]}
        />,
      );
      expect(getDeleteConditionButtons()).toEqual([]);

      // 2 predicates
      render(
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
      expect(getDeleteConditionButtons()).toHaveLength(2);
    });

    it("deletes the predicate row when clicked", async () => {
      const expectedOverride: Override<TestPredicates> = {
        _uuid: "mock-uuid-1",
        score: 2,
        num: { op: "EQ", value: 1 },
      };
      const initialOverride: Override<TestPredicates> = {
        ...expectedOverride,
        bool: { op: "EQ", value: true },
      };
      const setOverridesMock = jest.fn();

      const { queryAllByRole } = render(
        <WeightedScorableOverrides
          data={testPredicatesData}
          overrides={[initialOverride]}
          setOverrides={setOverridesMock}
        />,
      );
      const deleteConditionButtons = queryAllByRole("button", { name: /delete condition/i });
      await userEvent.click(deleteConditionButtons[0]); // Delete the `bool` predicate

      expect(setOverridesMock).toHaveBeenCalledWith([expectedOverride]);
    });
  });
});
