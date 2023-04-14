import { nullToUndefined, undefinedToNull } from "../object";

describe("Utils - Object", () => {
  test("nullToUndefined()", () => {
    const input = {
      a: { b: null, c: 10 },
      d: [{ e: null, f: 20 }],
    };
    expect(nullToUndefined(input)).toStrictEqual({
      a: { c: 10 },
      d: [{ f: 20 }],
    });
  });

  test("undefinedToNull()", () => {
    const input = {
      a: { b: undefined, c: 10 },
      d: [{ e: undefined, f: 20 }],
    };
    expect(undefinedToNull(input)).toStrictEqual({
      a: { b: null, c: 10 },
      d: [{ e: null, f: 20 }],
    });
  });
});
