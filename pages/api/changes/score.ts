import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { CREATE_CHANGE_LOG } from "@/graphql/mutations/appealMutations";
import {
  GET_SCORE_CHANGE_VALIDATION_DATA_WITHOUT_APPEAL_ID,
  GET_SCORE_CHANGE_VALIDATION_DATA_WITH_APPEAL_ID,
} from "@/graphql/queries/appealQueries";
import { parse } from "cookie";
import { ChangeLogTypes } from "@/types/appeal";
import { getLocalDateFromString } from "@/utils/date";

function validateState(state) {
  return (
    typeof state === "object" &&
    "type" in state &&
    state.type === "score" &&
    "score" in state &&
    typeof state.score === "number"
  );
}

async function handlePostScoreChange(req: NextApiRequest, res: NextApiResponse) {
  // Body should contain: (appealId OR (userId AND assignmentConfigId)), reason, originalState, updatedState
  const body = req.body;
  const cookies = parse(req.headers.cookie!);

  const appealId = body.appealId;
  const initiatedBy = parseInt(cookies["user"]);
  let userId = body.userId;
  let assignmentConfigId = body.assignmentConfigId;

  const now: Date = new Date();

  // Validate original state and updated state have the correct data structure
  if (!validateState(body.originalState) || !validateState(body.updatedState)) {
    return res.status(422).json({
      status: "error",
      error: "Format error for originalState and/or updatedState.",
    });
  }

  try {
    if (appealId) {
      // This score change is affiliated with an appeal
      const {
        data: { data: scoreChangeValidationData },
      } = await axios({
        method: "POST",
        headers: {
          cookie: req.headers.cookie,
        },
        url: `http://${process.env.API_URL}/v1/graphql`,
        data: {
          query: GET_SCORE_CHANGE_VALIDATION_DATA_WITH_APPEAL_ID.loc?.source.body,
          variables: { appealId },
        },
      });
      console.log(scoreChangeValidationData);
      userId = scoreChangeValidationData.appeal.userId;
      assignmentConfigId = scoreChangeValidationData.appeal.assignmentConfigId;

      // Score change cannot be sent before the corresponding appeal attempt
      const appealCreatedAt = getLocalDateFromString(scoreChangeValidationData.appeal.createdAt);
      if (appealCreatedAt && now < appealCreatedAt) {
        return res.status(403).json({
          status: "error",
          error: "Should not perform score change before creation of this appeal.",
        });
      }
    } else if (userId && assignmentConfigId) {
      // This score change is not affiliated with an appeal, e.g. change score because of late submission
      const {
        data: { data: scoreChangeValidationData },
      } = await axios({
        method: "POST",
        headers: {
          cookie: req.headers.cookie,
        },
        url: `http://${process.env.API_URL}/v1/graphql`,
        data: {
          query: GET_SCORE_CHANGE_VALIDATION_DATA_WITHOUT_APPEAL_ID.loc?.source.body,
          variables: { userId, assignmentConfigId },
        },
      });
      console.log(scoreChangeValidationData);

      if (!scoreChangeValidationData.assignment_config_user_aggregate.aggregate.count) {
        return res.status(403).json({
          status: "error",
          error: "Cannot change score of student not assigned to this assignment.",
        });
      }

      // Score change logs cannot be created before all submissions are collected
      if (!scoreChangeValidationData.assignmentConfig.stopCollection) {
        return res.status(403).json({
          status: "error",
          error: "Cannot change score before deadline.",
        });
      }
    } else {
      // Missing required data fields
      return res.status(422).json({
        status: "error",
        error: "Missing required data fields.",
      });
    }

    const changeLogInput = {
      type: ChangeLogTypes.SCORE,
      originalState: body.originalState,
      updatedState: body.updatedState,
      initiatedBy,
      reason: body.reason,
      appealId: appealId ?? null,
      userId,
      assignmentConfigId,
    };

    // Create appeal message entry
    const { data: result } = await axios({
      method: "POST",
      headers: {
        cookie: req.headers.cookie,
      },
      url: `http://${process.env.API_URL}/v1/graphql`,
      data: {
        query: CREATE_CHANGE_LOG.loc?.source.body,
        variables: {
          input: changeLogInput,
        },
      },
    });
    console.log(result);

    if (result.errors) {
      throw Error(JSON.stringify(result.errors));
    }

    return res.status(201).json({
      status: "success",
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method?.toUpperCase()) {
      case "POST":
        return handlePostScoreChange(req, res);
      default:
        return res.status(400).json({
          status: "error",
          error: "Bad request.",
        });
    }
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
