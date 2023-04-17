import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { UPDATE_APPEAL_STATUS } from "@/graphql/mutations/appealMutations";
import { GET_LATEST_APPEAL, GET_UPDATE_APPEAL_STATUS_VALIDATION_DATA } from "@/graphql/queries/appealQueries";
import { parse } from "cookie";
import { AppealStatus, ChangeLogTypes } from "@/types/appeal";
import { getLocalDateFromString } from "@/utils/date";

function validateState(state) {
  return (
    typeof state === "object" &&
    "type" in state &&
    state.type === "status" &&
    "status" in state &&
    state.status in AppealStatus
  );
}

async function handlePostUpdateAppealStatus(req: NextApiRequest, res: NextApiResponse) {
  // Body should contain: appealId, reason, updatedState
  const body = req.body;
  const cookies = parse(req.headers.cookie!);

  const appealId = body.appealId;
  const initiatedBy = parseInt(cookies["user"]);

  const now: Date = new Date();

  // Validate original state and updated state have the correct data structure
  if (!validateState(body.updatedState)) {
    return res.status(422).json({
      status: "error",
      error: "Format error for updatedState.",
    });
  }

  const status = body.updatedState.status;

  try {
    const {
      data: { data: updateAppealStatusValidationData },
    } = await axios({
      method: "POST",
      headers: {
        cookie: req.headers.cookie,
      },
      url: `http://${process.env.API_URL}/v1/graphql`,
      data: {
        query: GET_UPDATE_APPEAL_STATUS_VALIDATION_DATA.loc?.source.body,
        variables: { appealId },
      },
    });
    const userId = updateAppealStatusValidationData.appeal.userId;
    const assignmentConfigId = updateAppealStatusValidationData.appeal.assignmentConfigId;

    const {
      data: { data: latestAppeal },
    } = await axios({
      method: "POST",
      headers: {
        cookie: req.headers.cookie,
      },
      url: `http://${process.env.API_URL}/v1/graphql`,
      data: {
        query: GET_LATEST_APPEAL.loc?.source.body,
        variables: { userId, assignmentConfigId },
      },
    });
    console.log(updateAppealStatusValidationData, latestAppeal);

    // Assignment config does not allow student to file appeal
    if (!updateAppealStatusValidationData.appeal.assignmentConfig.isAppealAllowed) {
      return res.status(403).json({
        status: "error",
        error: "This assignment config does not allow student grade appeals.",
      });
    }

    // Appeal status change cannot be performed before the corresponding appeal attempt
    const appealCreatedAt = getLocalDateFromString(updateAppealStatusValidationData.appeal.createdAt);
    if (appealCreatedAt && now < appealCreatedAt) {
      return res.status(403).json({
        status: "error",
        error: "Should not update appeal status before appeal time.",
      });
    }

    // Appeal status change cannot be performed before the previous update
    const appealUpdatedAt = getLocalDateFromString(updateAppealStatusValidationData.appeal.updatedAt);
    if (appealUpdatedAt && now < appealUpdatedAt) {
      return res.status(403).json({
        status: "error",
        error: "Should not update appeal status before appeal time.",
      });
    }

    // Validate updatedState different from originalState
    if (updateAppealStatusValidationData.appeal.status === body.updatedState.status) {
      return res.status(403).json({
        status: "error",
        error: "Cannot update to the same appeal status.",
      });
    }

    // Validate this is latest appeal attempt
    if (latestAppeal.appeals.length && latestAppeal.appeals[0].id !== appealId) {
      return res.status(403).json({
        status: "error",
        error: "Should not change appeal status of previous finalized appeals.",
      });
    }

    const changeLogInput = {
      type: ChangeLogTypes.APPEAL_STATUS,
      originalState: {
        type: "status",
        status: updateAppealStatusValidationData.appeal.status,
      },
      updatedState: body.updatedState,
      initiatedBy,
      reason: body.reason,
      appealId,
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
        query: UPDATE_APPEAL_STATUS.loc?.source.body,
        variables: {
          changeLogInput,
          status,
          appealId,
        },
      },
    });
    console.log(result);

    if (result.errors) {
      console.log(result.errors[0].extensions);
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
        return handlePostUpdateAppealStatus(req, res);
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
