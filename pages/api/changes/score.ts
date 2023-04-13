import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { CREATE_CHANGE_LOG } from "@/graphql/mutations/appealMutations";
import { GET_APPEAL_MESSAGE_VALIDATION_DATA } from "@/graphql/queries/appealQueries";

async function handlePostScoreChange(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body;
  const appealId = body.appealId;

  // TODO(Owen)
  console.log(req.headers.cookie);

  const now: Date = new Date();
  body.createdAt = zonedTimeToUtc(now, "Asia/Hong_Kong");
  body.initiatedBy = parseInt(req.headers.cookie!);

  try {
    // Search for assignment config, sender identity and
    const {
      data: { data: appealMessageValidationData },
    } = await axios({
      method: "POST",
      headers: {
        cookie: req.headers.cookie,
      },
      url: `http://${process.env.API_URL}/v1/graphql`,
      data: {
        query: GET_APPEAL_MESSAGE_VALIDATION_DATA.loc?.source.body,
        variables: { appealId, senderId },
      },
    });
    console.log(appealMessageValidationData);

    // Assignment config does not allow student to file appeal
    if (!appealMessageValidationData.appeal.assignmentConfig.isAppealAllowed) {
      return res.status(403).json({
        status: "error",
        error: "This assignment config does not allow student grade appeals.",
      });
    }

    // Appeal message cannot be sent before appeal start
    if (!appealMessageValidationData.appeal.assignmentConfig.appealStartAt) {
      return res.status(403).json({
        status: "error",
        error: "Appeal period not configured.",
      });
    }
    const appealStartAt: Date = utcToZonedTime(
      appealMessageValidationData.appeal.assignmentConfig.appealStartAt,
      "Asia/Hong_Kong",
    );
    if (now.getTime() < appealStartAt.getTime()) {
      return res.status(403).json({
        status: "error",
        error: "Should not send appeal messages before appeal period.",
      });
    }

    // Appeal message cannot be sent before the corresponding appeal attempt
    const appealCreatedAt: Date = utcToZonedTime(appealMessageValidationData.appeal.createdAt, "Asia/Hong_Kong");
    if (now.getTime() < appealCreatedAt.getTime()) {
      return res.status(403).json({
        status: "error",
        error: "Should not send appeal messages before appeal time.",
      });
    }

    // Create appeal message entry
    const { data: result } = await axios({
      method: "POST",
      headers: {
        cookie: req.headers.cookie,
      },
      url: `http://${process.env.API_URL}/v1/graphql`,
      data: {
        query: CREATE_CHANGE_LOG.loc?.source.body,
        variables: { input: body },
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
