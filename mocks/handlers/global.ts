import { RequestHandler, graphql } from "msw";

/**
 * Global handlers that are used in all tests.
 */
export const handlers: RequestHandler[] = [
  graphql.query("getUserRole", (_, res, ctx) =>
    res(
      ctx.data({
        user: {
          hasTeachingRole: true,
          isAdmin: true,
        },
      }),
    ),
  ),
  graphql.query("getSidebarData", (_, res, ctx) =>
    res(
      ctx.data({
        user: {
          id: 1,
          itsc: "~ta",
          name: "TEACHING, Assistant",
          initials: "TA",
          courses: [{ course: { id: 1, code: "COMP2011" } }],
        },
        semesters: [{ id: 2210, name: "2022-23 Fall" }],
      }),
    ),
  ),
  graphql.query("getTeachingCourses", (_, res, ctx) =>
    res(
      ctx.data({
        user: {
          courses: [{ course: { id: 1, name: "Programming with C++", code: "COMP2011" } }],
        },
      }),
    ),
  ),
];
