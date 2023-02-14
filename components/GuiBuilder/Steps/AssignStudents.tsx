import { AssignedStudents, CourseWideAssignStudents, UnassignedStudents } from "@/components/Config/Users";
import { Spinner } from "@/components/Spinner";
import { GET_STUDENTS_FOR_CONFIG } from "@/graphql/queries/user";
import { useStoreState } from "@/store/GuiBuilder";
import { AssignmentConfig } from "@/types/tables";
import { useSubscription } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea } from "@mantine/core";
import LockedStep from "./LockedStep";

function AssignStudents() {
  const configId = useStoreState((state) => state.config.configId);

  const { data, loading } = useSubscription<{ assignmentConfig: AssignmentConfig }>(GET_STUDENTS_FOR_CONFIG, {
    variables: {
      id: configId,
    },
  });

  if (configId === null) {
    return <LockedStep />;
  }

  return (
    <div className="h-full flex justify-center">
      <ScrollArea type="auto" className="w-1/2 h-full bg-cool-gray-50 drop-shadow rounded-md">
        {loading && (
          <div className="mt-16 flex justify-center">
            <Spinner className="h-16 w-16 text-cse-500" />
          </div>
        )}
        {!loading && data && (
          <>
            <div className="px-6 pt-5 flex items-center gap-3">
              <FontAwesomeIcon className="text-blue-500" icon={["far", "info-circle"]} />
              <p className="text-blue-500">Changes in this page are auto-saved.</p>
            </div>
            <CourseWideAssignStudents
              assignmentConfigId={configId}
              sections={data.assignmentConfig.assignment.course.sections}
            />
            <div className="px-6 pb-6 flex-1 flex flex-col">
              <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-4">
                <FontAwesomeIcon className="mr-2" icon={["fad", "users-class"]} />
                Course Sections
              </h2>
              <ul className="space-y-3">
                {data.assignmentConfig.assignment.course.sections.map((section) => (
                  <li key={section.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-6 py-4">
                      <h2 className="font-medium text-sm text-gray-500 tracking-wider">{section.name}</h2>
                    </div>
                    <div className="p-3 bg-gray-50">
                      <AssignedStudents
                        assignmentConfigId={configId}
                        assignedUserIds={data.assignmentConfig.affected_users.map(({ user_id }) => user_id)}
                        section={section}
                      />
                      <UnassignedStudents
                        assignmentConfigId={configId}
                        section={section}
                        assignedUserIds={data.assignmentConfig.affected_users.map(({ user_id }) => user_id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );
}

export default AssignStudents;
