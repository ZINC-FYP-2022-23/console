import { existsSync, readdirSync, readFileSync } from "fs-extra";
import { NextApiRequest, NextApiResponse } from "next";

const generatedDir = process.env.GENERATED_EXPECTED_OUTPUT_FOLDER || "expectedOutput";

/**
 * This API queries the files generated by the Grader. It has two endpoints:
 * - `/generated?fileName=XXX` - Get the content of a file given by `fileName`.
 * - `/generated` - Get the file names of all generated files.
 *
 * The Grader can generate new files when executing a pipeline, which are saved in the `generated/assignment` folder
 * in the shared directory.
 */
function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileName } = req.query;
  if (fileName) return getGeneratedFile(req, res);
  return getAllGeneratedFileNames(req, res);
}

/** Response payload of {@link getAllGeneratedFileNames}. */
export type GetAllGeneratedFileNamesResponse = {
  /** List of file names. It is `null` when an error has occurred. */
  fileNames: string[] | null;
  /** Error message if any. */
  error: string | null;
};

/**
 * Get the file names of all generated files.
 */
function getAllGeneratedFileNames(req: NextApiRequest, res: NextApiResponse<GetAllGeneratedFileNamesResponse>) {
  return new Promise<void>((resolve) => {
    const { assignmentConfigId } = req.query;
    const folderPath = `${process.env.NEXT_PUBLIC_UPLOAD_DIR}/generated/assignment/${assignmentConfigId}/${generatedDir}`;

    try {
      if (!existsSync(folderPath)) {
        res.send({ fileNames: [], error: null });
        resolve();
      }
      const fileNames = readdirSync(folderPath);
      res.send({ fileNames, error: null });
      resolve();
    } catch (error: any) {
      res.status(500).send({ fileNames: null, error: error.message });
      resolve();
    }
  });
}

/** Response payload of {@link getGeneratedFile}. */
export type GetGeneratedFileResponse = {
  /** Content of the file. It's `null` if the file is not found. */
  content: string | null;
  /** Error message if any. */
  error: string | null;
};

/**
 * Read the content of a file generated by the Grader.
 */
function getGeneratedFile(req: NextApiRequest, res: NextApiResponse<GetGeneratedFileResponse>) {
  return new Promise<void>((resolve) => {
    const { assignmentConfigId, fileName } = req.query;
    const filePath = `${process.env.NEXT_PUBLIC_UPLOAD_DIR}/generated/assignment/${assignmentConfigId}/${generatedDir}/${fileName}`;

    try {
      if (!existsSync(filePath)) {
        res.send({ content: null, error: `Cannot find file ${filePath}` });
        resolve();
      }
      const content = readFileSync(filePath, { encoding: "utf-8" });
      res.send({ content, error: null });
      resolve();
    } catch (error: any) {
      res.status(500).send({ content: null, error: error.message });
      resolve();
    }
  });
}

export default handler;
