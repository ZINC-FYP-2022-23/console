import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";

interface InitializationErrorProps {
  error: Error;
}

/**
 * Error message shown when GUI Assignment Builder fails to initialize.
 *
 * This can happen when the user is loading an existing config and:
 *  - the config YAML has duplicate stage keys (e.g. two `"compile"` stages) or invalid YAML syntax.
 *  - an GraphQL error occurs while fetching the existing config.
 */
function InitializationError({ error }: InitializationErrorProps) {
  const router = useRouter();
  const { assignmentId, assignmentConfigId } = router.query;

  const isYamlException = error.name === "YAMLException";

  console.error("Error while initializing GUI Mode", error);

  return (
    <div className="max-w-4/5 m-auto p-8 flex flex-col item-center gap-6 bg-white rounded-md shadow">
      <div className="flex items-center gap-5">
        <FontAwesomeIcon icon={["fas", "circle-exclamation"]} className="text-4xl text-red-500" />
        <h1 className="font-semibold text-2xl text-center text-red-500">Something went wrong</h1>
      </div>
      <div className="space-y-3 text-gray-800">
        <p>
          GUI Mode fails to load due to the following{" "}
          {isYamlException ? "error in the configuration YAML" : "unknown error"}:
        </p>
        <pre className="inline-block text-gray-600 text-sm whitespace-pre-wrap">{error.message}</pre>
        {isYamlException && <p>You can first fix the above error in YAML Editor Mode, then re-open GUI Mode.</p>}
      </div>
      <div className="flex items-center gap-4">
        <Link href={`/assignments/${assignmentId}/configs/${assignmentConfigId}/yaml`}>
          <a className="px-4 py-1 flex items-center justify-center bg-cse-500 border border-transparent font-medium rounded-md text-white transition ease-in-out duration-150 hover:bg-cse-600">
            <FontAwesomeIcon icon={["far", "code"]} className="mr-3" />
            <span>Edit in YAML Editor Mode</span>
          </a>
        </Link>
        <a
          href="mailto:support@zinc.cse.ust.hk"
          className="inline-flex items-center px-4 py-1 border border-transparent font-medium rounded-md text-cse-700 bg-blue-100 hover:bg-blue-50 focus:outline-none focus:border-cse-700 focus:shadow-outline-indigo active:bg-blue-200 transition ease-in-out duration-150"
        >
          <FontAwesomeIcon icon={["fas", "envelope"]} className="mr-3" />
          <span>Contact Us</span>
        </a>
      </div>
    </div>
  );
}

export default InitializationError;
