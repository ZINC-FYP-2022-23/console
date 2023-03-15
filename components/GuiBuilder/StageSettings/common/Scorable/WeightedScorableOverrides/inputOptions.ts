import { SelectItem } from "@/components/Input";
import {
  JoinPolicy,
  PredicateOpCompare,
  PredicateOpEqual,
  PredicateOpString,
  PredicateSupportedValueTypes,
  XUnitOverridePredicates,
} from "@/types/GuiBuilder";
import { PredicateData } from "./WeightedScorableOverrides";

/**
 * Select input options for how to join multiple predicates.
 *
 * See {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#override the docs}.
 */
export const joinPolicyOptions: SelectItem<JoinPolicy>[] = [
  { value: "AND", label: "all" },
  { value: "OR", label: "any" },
];

/**
 * Select input options for {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#equalop boolean predicate operations}.
 */
export const predicateOpEqualOptions: SelectItem<PredicateOpEqual>[] = [
  { value: "EQ", label: "equals" },
  { value: "NOT_EQ", label: "not equals" },
];

/**
 * Select input options for {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#compareop numerical predicate operations}.
 */
export const predicateOpCompareOptions: SelectItem<PredicateOpCompare>[] = [
  { value: "EQ", label: "equals" },
  { value: "NOT_EQ", label: "not equals" },
  { value: "LT", label: "less than" },
  { value: "LT_EQ", label: "less than or equals" },
  { value: "GT", label: "greater than" },
  { value: "GT_EQ", label: "greater than or equals" },
];

/**
 * Select input options for {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#strequalop string predicate operations}.
 */
export const predicateOpStringOptions: SelectItem<PredicateOpString>[] = [
  { value: "EQ", label: "equals" },
  { value: "NOT_EQ", label: "not equals" },
  { value: "CASE_IGNORE_EQ", label: "ignore case equals" },
  { value: "CASE_IGNORE_NOT_EQ", label: "ignore case not equals" },
  { value: "REGEX_EQ", label: "matches regex" },
  { value: "REGEX_NOT_EQ", label: "not matches regex" },
];

/**
 * A map of predicate value types to their select input options.
 */
export const predicateOpOptions: Record<PredicateSupportedValueTypes, SelectItem[]> = {
  boolean: predicateOpEqualOptions,
  number: predicateOpCompareOptions,
  string: predicateOpStringOptions,
};

/**
 * Select input options for specifying the value of a
 * {@link https://docs.zinc.ust.dev/user/pipeline/Scorable.html#equalop boolean predicate}.
 */
export const predicateValueBooleanOptions: SelectItem[] = [
  { value: "true", label: "True" },
  { value: "false", label: "False" },
];

/**
 * Data of what predicate fields the user can add for a stage that adopts
 * {@link https://docs.zinc.ust.dev/user/pipeline/docker/XUnit.html#weighted-scorable XUnit Weighted Scorable}.
 */
export const xUnitOverridePredicatesData: PredicateData<XUnitOverridePredicates>[] = [
  {
    key: "className",
    label: "Class name",
    type: "string",
  },
  {
    key: "testName",
    label: "Test case name",
    type: "string",
  },
  {
    key: "displayName",
    label: "Test case display name",
    type: "string",
  },
];
