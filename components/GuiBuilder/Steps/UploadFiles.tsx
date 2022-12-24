import { useStoreState } from "@state/GuiBuilder/Hooks";
import LockedStep from "./LockedStep";

function UploadFiles() {
  const configId = useStoreState((state) => state.configId);

  if (configId === null) {
    return <LockedStep />;
  }

  return <div>UploadFiles</div>;
}

export default UploadFiles;
