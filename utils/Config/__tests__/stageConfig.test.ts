/**
 * @file Tests for conversion of raw stage configs with {@link SupportedStage.configFromRaw} and
 * {@link SupportedStage.configToRaw}.
 */

import supportedStages, { SupportedStage } from "@constants/Config/supportedStages";
import { Compile, CompileRaw, FileStructureValidation, Score, ScoreRaw, StageDataMap } from "@types";
import * as uuid from "uuid";
import { configsToConfigsRaw, parseStages } from "../stage";

const UUID = "mock-uuid-1";

jest.mock("uuid");
jest.spyOn(uuid, "v4").mockReturnValue(UUID);

const createRawStage = <T>(key: string, config: T) => ({
  [key]: config,
});

const createStage = <T>(name: string, config: T): StageDataMap => ({
  [UUID]: {
    name,
    label: "",
    kind: supportedStages[name].kind,
    config,
  },
});

describe("Raw stage configs conversion", () => {
  describe("Compile", () => {
    describe("configFromRaw", () => {
      it("converts `flags` array to a string", () => {
        const stage = createRawStage<CompileRaw>("compile", {
          input: ["*.cpp"],
          flags: ["-Wall", "-Wextra", "-g"],
        });
        expect(parseStages(stage)[1][UUID].config).toEqual({
          input: ["*.cpp"],
          flags: "-Wall -Wextra -g",
        });
      });
    });

    describe("configToRaw", () => {
      it("trims the string in `output`", () => {
        const stage = createStage<Compile>("Compile", {
          input: ["*.cpp"],
          output: "  a.out  ",
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config.output).toBe("a.out");
      });

      it("converts `flags` to string array", () => {
        const stage = createStage<Compile>("Compile", {
          input: ["*.cpp"],
          flags: "  -Wall -Wextra   -g   ",
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config.flags).toEqual(["-Wall", "-Wextra", "-g"]);
      });
    });
  });

  describe("FileStructureValidation", () => {
    describe("configToRaw", () => {
      it("trims and removes empty strings in `ignore_in_submission`", () => {
        const stage = createStage<FileStructureValidation>("FileStructureValidation", {
          ignore_in_submission: ["  a.txt", "", "b.txt  "],
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config.ignore_in_submission).toEqual(["a.txt", "b.txt"]);
      });

      it("converts empty `ignore_in_submission` array to undefined", () => {
        const stage = createStage<FileStructureValidation>("FileStructureValidation", {
          ignore_in_submission: [],
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config.ignore_in_submission).toBeUndefined();
      });
    });
  });

  describe("Score", () => {
    describe("configFromRaw", () => {
      it("converts all numerical fields to strings", () => {
        const stage = createRawStage<ScoreRaw>("score", {
          normalizedTo: 100,
          minScore: 0,
          maxScore: 100.5,
        });
        expect(parseStages(stage)[1][UUID].config).toEqual({
          normalizedTo: "100",
          minScore: "0",
          maxScore: "100.5",
        });
      });

      it("converts all undefined fields to empty strings", () => {
        const stage = createRawStage<ScoreRaw>("score", {
          normalizedTo: 100,
        });
        expect(parseStages(stage)[1][UUID].config).toEqual({
          normalizedTo: "100",
          minScore: "",
          maxScore: "",
        });
      });
    });

    describe("configToRaw", () => {
      it("converts numerical strings to numbers", () => {
        const stage = createStage<Score>("Score", {
          normalizedTo: "100",
          minScore: "0",
          maxScore: "100.5",
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config).toEqual({
          normalizedTo: 100,
          minScore: 0,
          maxScore: 100.5,
        });
      });

      it("converts empty strings to undefined", () => {
        const stage = createStage<Score>("Score", {
          normalizedTo: "100",
          minScore: "",
          maxScore: "",
        });
        const _stage = configsToConfigsRaw(stage);
        expect(_stage[UUID].config).toEqual({
          normalizedTo: 100,
          minScore: undefined,
          maxScore: undefined,
        });
      });
    });
  });
});
