import { useStoreState } from "@/store/GuiBuilder";
import LockedStep from "./LockedStep";

function UploadFiles() {
  const configId = useStoreState((state) => state.config.configId);

  if (configId === null) {
    return <LockedStep />;
  }

  return <div>UploadFiles</div>;
}

export default UploadFiles;
