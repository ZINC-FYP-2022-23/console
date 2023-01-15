import { useStoreState } from "@store/GuiBuilder";
import LockedStep from "./LockedStep";

function AssignStudents() {
  const configId = useStoreState((state) => state.config.configId);

  if (configId === null) {
    return <LockedStep />;
  }

  return <div>AssignStudents</div>;
}

export default AssignStudents;
