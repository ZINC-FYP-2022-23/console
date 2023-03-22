import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Downloads the config YAML as a file.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { assignmentConfigId } = req.query;
    const {
      data: { data },
    } = await axios({
      method: "post",
      headers: {
        cookie: req.headers.cookie,
      },
      url: `http://${process.env.API_URL}/v1/graphql`,
      data: {
        query: `
          query getConfigYaml($id: bigint!) {
            assignmentConfig(id: $id) {
              config_yaml
            }
          }
        `,
        variables: { id: assignmentConfigId },
      },
    });
    const { config_yaml } = data.assignmentConfig;
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename=config_${assignmentConfigId}.yaml`);
    res.send(config_yaml);
  } catch (error: any) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
}

export default handler;
