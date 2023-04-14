import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import * as Sentry from "@sentry/nextjs";
import JSZip from "jszip";
import { SIDEBAR } from "../graphql/queries/user";
import { Diagnostic } from "../types";

interface ZincContextState {
  user: number;
  currentSemester: number;
  activeSemester: number;
  useSidebar: () => any;
  isAdmin: boolean;
  submitFile: (files: any, assignmentConfigId: number, userId: number, isTest?: boolean) => Promise<any>;
  uploadGradingPackage: (files, assignmentConfigId) => Promise<any>;
  validateAssignmentConfig: (
    yaml: string,
    assignmentConfigId: string,
  ) => Promise<{
    id: string;
    /** Stringified array of objects with type {@link Diagnostic}. */
    configError?: string;
  }>;
  triggerManualGrading: (configId: string, usersBeingGraded?: Array<number>) => Promise<any>;
}

interface ZincProviderProps {
  children: JSX.Element;
  user: number;
  itsc: string;
  semester: number;
  isAdmin: boolean;
}

const ZincContext = React.createContext({} as ZincContextState);
export const useZinc = () => useContext(ZincContext);

export const ZincProvider = ({ children, user, itsc, semester, isAdmin }: ZincProviderProps) => {
  const router = useRouter();
  const { semesterId } = router.query;
  const activeSemester = semesterId ? parseInt(semesterId as string, 10) : semester;
  Sentry.setUser({ username: itsc });

  const useSidebar = () =>
    useQuery(SIDEBAR, {
      variables: {
        userId: user,
        semesterId: semester,
      },
    });

  (function () {
    if (typeof window !== "undefined") {
      File.prototype.arrayBuffer = File.prototype.arrayBuffer || myArrayBuffer;
      Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || myArrayBuffer;

      function myArrayBuffer() {
        // this: File or Blob
        return new Promise((resolve) => {
          let fr = new FileReader();
          fr.onload = () => {
            resolve(fr.result);
          };
          // @ts-ignore
          fr.readAsArrayBuffer(this);
        });
      }
    }
  })();

  async function getChecksum(file) {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  const supportedCodeSubmissionExtensions = ["h", "hpp", "cpp", "py", "java"];

  const uploadGradingPackage = async (files, assignmentConfigId) => {
    const form = new FormData();
    const digest = await getChecksum(files[0]);
    form.append(`checksum;${files[0].name}`, digest);
    form.append("files", files[0], files[0].name);
    try {
      const response = await fetch(`/api/configs/${assignmentConfigId}/helpers`, {
        method: "POST",
        body: form,
      });
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  /**
   * @param isTest Explicitly set the `isTest` flag in the Redis payload of the grading task. If not specified,
   * `isTest` will be evaluated to true in the webhook if the user is a TA.
   */
  const submitFile = async (files: any, assignmentConfigId: number, userId: number, isTest?: boolean) => {
    const form = new FormData();
    form.append("assignmentConfigId", assignmentConfigId.toString());
    form.append("userId", userId.toString());
    if (
      files.length > 1 ||
      (files.length === 1 && supportedCodeSubmissionExtensions.includes(files[0].name.split(".").pop()))
    ) {
      const zip = new JSZip();
      for (const file of files) {
        zip.file(file.name, file);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const file = new File([blob], `aggregated.zip`, { lastModified: Date.now() });
      const digest = await getChecksum(file);
      form.append(`checksum;${file.name}`, digest);
      form.append("files", file, file.name);
    } else {
      const digest = await getChecksum(files[0]);
      form.append(`checksum;${files[0].name}`, digest);
      form.append("files", files[0], files[0].name);
    }
    if (isTest !== undefined) {
      form.append("isTest", isTest.toString());
    }
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        body: form,
      });
      return response.json();
    } catch (error) {
      console.error(error);
    }
  };

  const validateAssignmentConfig = async (
    yaml: string,
    assignmentConfigId: string,
  ): Promise<{ id: string; configError?: string }> => {
    try {
      const response = await fetch(`/api/configs/${assignmentConfigId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yaml,
        }),
      });
      return response.json();
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.message);
    }
  };

  const triggerManualGrading = async (configId: string, submissions: Array<number> = []) => {
    try {
      const response = await fetch(`/api/pipeline/${configId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissions,
          initiatedBy: user,
        }),
      });
      return response.json();
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.message);
    }
  };

  return (
    <ZincContext.Provider
      value={{
        user,
        activeSemester,
        currentSemester: semester,
        useSidebar,
        isAdmin,
        submitFile,
        uploadGradingPackage,
        validateAssignmentConfig,
        triggerManualGrading,
      }}
    >
      {children}
    </ZincContext.Provider>
  );
};
