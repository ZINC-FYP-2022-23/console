import { useStoreState } from "@/store/GuiBuilder";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useBeforeunload } from "react-beforeunload";

/**
 * Regex pattern for the URL of the GUI Assignment Builder with the domain omitted.
 *
 * An example string that matches the pattern is `"/assignments/1/configs/1/gui?step=settings"`.
 */
const guiBuilderUrlPattern = /^\/assignments\/.*\/configs\/.*\/gui(\?.*)*$/;

/**
 * Opens a browser dialog to warn if the user wishes to leave the page without saving changes.
 */
export default function useWarnUnsavedChanges() {
  const isEditedAny = useStoreState((state) => state.config.isEdited.any);
  const router = useRouter();

  // Handle document unload (e.g. browser tab close)
  useBeforeunload((event) => {
    if (isEditedAny) {
      event.preventDefault();
    }
  });

  // Handle change in in-app (Next.js) route
  useEffect(() => {
    if (isEditedAny) {
      const routeChangeStart = (newUrl: string) => {
        // Don't warn for changes in the GUI Assignment Builder's query parameters
        if (newUrl.match(guiBuilderUrlPattern)) return;

        const ok = confirm("You have unsaved changes. Are you sure you want to leave this page?");
        if (!ok) {
          router.events.emit("routeChangeError");
          // This exception can be safely ignored. See https://github.com/vercel/next.js/issues/2476
          throw "Abort route change";
        }
      };
      router.events.on("routeChangeStart", routeChangeStart);

      return () => {
        router.events.off("routeChangeStart", routeChangeStart);
      };
    }
  }, [isEditedAny, router.events]);
}
