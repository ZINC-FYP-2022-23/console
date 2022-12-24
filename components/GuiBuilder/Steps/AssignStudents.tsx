import { useStoreState } from "@state/GuiBuilder/Hooks";
import LockedStep from "./LockedStep";

function AssignStudents() {
  const configId = useStoreState((state) => state.configId);

  if (configId === null) {
    return <LockedStep />;
  }

  return <div>AssignStudents</div>;
}

export default AssignStudents;
