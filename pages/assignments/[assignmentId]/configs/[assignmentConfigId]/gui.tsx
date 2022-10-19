import { useQuery } from "@apollo/client";
import GUIAssignmentBuilder from "@components/GuiBuilder/GuiBuilder";
import { LayoutProvider } from "@contexts/layout";
import { GET_PIPELINE_CONFIG_FOR_ASSIGNMENT } from "@graphql/queries/user";
import { Layout } from "@layout";
import { initializeApollo } from "@lib/apollo";
import configStore from "@state/GuiBuilder/Store";
import { AssignmentConfig } from "@types";
import { createStore, StoreProvider } from "easy-peasy";
import { GetServerSideProps } from "next";

const store = createStore(configStore);

interface GUIAssignmentBuilderRootProps {
  /** The `assignmentConfigId`. If it's `null`, it means we're creating a new assignment. */
  configId: number | null;
}

function GUIAssignmentBuilderRoot({ configId }: GUIAssignmentBuilderRootProps) {
  const isNewAssignment = configId === null;
  const { data, error } = useQuery<{ assignmentConfig: AssignmentConfig }>(GET_PIPELINE_CONFIG_FOR_ASSIGNMENT, {
    variables: {
      assignmentConfigId: configId,
    },
  });

  // When creating a new assignment, the GraphQL query will always have error, which is expected behavior
  // since `configId` is null. Hence, we handle query error only when modifying an existing assignment.
  if (!isNewAssignment && error) {
    // TODO(Anson): Better handling of error
    console.error(error);
  }

  return (
    <LayoutProvider>
      <Layout title="Assignment Config">
        <StoreProvider store={store}>
          <GUIAssignmentBuilder data={data} configId={configId} />
        </StoreProvider>
      </Layout>
    </LayoutProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const apolloClient = initializeApollo(req.headers.cookie!);
  /**
   * The `assignmentConfig` query param has two possible types of values:
   *  - Numerical string (e.g. `"1"`) when loading an existing assignment config
   *  - `"new"` when creating a new assignment config
   */
  let configId: string | number = query.assignmentConfigId as string;
  const isNew = configId === "new";
  if (!isNew) {
    configId = parseInt(configId);
    if (isNaN(configId)) {
      return { notFound: true };
    }
    const { data } = await apolloClient.query({
      query: GET_PIPELINE_CONFIG_FOR_ASSIGNMENT,
      variables: {
        assignmentConfigId: configId,
      },
    });
    if (data.assignmentConfig === null) {
      return { notFound: true };
    }
  }

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      configId: isNew ? null : configId,
    },
  };
};

export default GUIAssignmentBuilderRoot;
