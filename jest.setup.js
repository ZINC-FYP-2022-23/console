import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fad } from "@fortawesome/pro-duotone-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import "@testing-library/jest-dom";
import * as jestExtendedMatchers from "jest-extended";
import mockRouter from "next-router-mock";
import { createDynamicRouteParser } from "next-router-mock/dynamic-routes";

// jest-extended matchers: https://jest-extended.jestcommunity.dev/
expect.extend(jestExtendedMatchers);

// Register Font Awesome icons in component unit tests that uses them
library.add(fad, far, fas);

// Register dynamic routes for Next.js mock router (https://github.com/scottrippey/next-router-mock)
mockRouter.useParser(createDynamicRouteParser(["/assignments/[assignmentId]/configs/[assignmentConfigId]/gui"]));
