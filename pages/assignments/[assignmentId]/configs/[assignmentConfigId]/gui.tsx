import { useQuery } from "@apollo/client";
import Button from "components/Button";
import { LayoutProvider } from "contexts/layout";
import { GET_PIPELINE_CONFIG_FOR_ASSIGNMENT } from "graphql/queries/user";
import { Layout } from "layout";
import { initializeApollo } from "lib/apollo";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Config } from "types";

function GUIAssignmentBuilder() {
  const router = useRouter();
  const assignmentConfigId = parseInt(router.query.assignmentConfigId as string, 10);
  const { data, loading } = useQuery(GET_PIPELINE_CONFIG_FOR_ASSIGNMENT, {
    variables: {
      assignmentConfigId,
    },
  });

  if (data) {
    const config = Config.parseYaml(data.assignmentConfig.config_yaml);
    console.log(config);
  }

  return (
    <LayoutProvider>
      <Layout title="Assignment Configs">
        <div className="p-4 w-full flex flex-col">
          {/* Top bar */}
          <div className="mb-3 flex items-center justify-between">
            <h1 className="font-bold text-gray-900 text-xl sm:text-2xl">Assignment Config</h1>
            <div className="flex gap-2">
              <Button
                title="Create"
                className="px-3 py-1 bg-green-500 text-white hover:bg-green-600"
                onClick={() => {
                  // TODO
                }}
              />
            </div>
          </div>
          <div className="flex-1 flex flex-row gap-3">
            <div className="w-4/6 flex flex-col gap-3">
              <div className="h-1/2 bg-white rounded-md">Pipeline editor</div>
              <div className="h-1/2 bg-white rounded-md">Stage settings</div>
            </div>
            <div className="w-2/6 bg-white rounded-md">General settings</div>
          </div>
        </div>
      </Layout>
    </LayoutProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const apolloClient = initializeApollo(ctx.req.headers.cookie!);
  await apolloClient.query({
    query: GET_PIPELINE_CONFIG_FOR_ASSIGNMENT,
    variables: {
      assignmentConfigId: parseInt(ctx.query.assignmentConfigId as string, 10),
    },
  });
  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
};

export default GUIAssignmentBuilder;
