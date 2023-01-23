import { useStoreState } from "@/store/GuiBuilder";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useBeforeunload } from "react-beforeunload";

/**
 * Opens a browser dialog to warn if the user wishes to leave the page without saving changes.
 */
export default function useWarnUnsavedChanges() {
  const isEdited = useStoreState((state) => state.config.isEdited);
  const router = useRouter();

  // Handle document unload (e.g. browser tab close)
  useBeforeunload((event) => {
    if (isEdited) {
      event.preventDefault();
    }
  });

  // Handle change in in-app (Next.js) route
  useEffect(() => {
    if (isEdited) {
      const routeChangeStart = () => {
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
  }, [isEdited, router.events]);
}
