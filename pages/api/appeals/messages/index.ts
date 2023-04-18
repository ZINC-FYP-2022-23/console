import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { CREATE_APPEAL_MESSAGE } from "@/graphql/mutations/appealMutations";
import { GET_APPEAL_MESSAGE_VALIDATION_DATA } from "@/graphql/queries/appealQueries";
import { getLocalDateFromString } from "@/utils/date";

async function handlePostAppealMessage(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body;
  const senderId = body.senderId;
  const appealId = body.appealId;

  const now: Date = new Date();

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
    const appealStartAt = getLocalDateFromString(appealMessageValidationData.appeal.assignmentConfig.appealStartAt);
    if (appealStartAt && now < appealStartAt) {
      return res.status(403).json({
        status: "error",
        error: "Should not send appeal messages before appeal period.",
      });
    }

    // Appeal message cannot be sent before the corresponding appeal attempt
    const appealCreatedAt = getLocalDateFromString(appealMessageValidationData.appeal.createdAt);
    if (appealCreatedAt && now < appealCreatedAt) {
      return res.status(403).json({
        status: "error",
        error: "Should not send appeal messages before creation of this appeal.",
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
        query: CREATE_APPEAL_MESSAGE.loc?.source.body,
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
        return handlePostAppealMessage(req, res);
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
