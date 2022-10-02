import { useQuery } from "@apollo/client";
import GUIAssignmentBuilder from "components/GuiBuilder/GuiBuilder";
import { LayoutProvider } from "contexts/layout";
import { GET_PIPELINE_CONFIG_FOR_ASSIGNMENT } from "graphql/queries/user";
import { initializeApollo } from "lib/apollo";
import { GetServerSideProps } from "next";
import { AssignmentConfig, Config } from "types";
import { createStore, StoreProvider } from "easy-peasy";
import Store from "state/Config/Store";
import { useMemo } from "react";

const store = createStore(Store);

interface GUIAssignmentBuilderRootProps {
  /** The `assignmentConfigId`. If it's `null`, it means we're creating a new assignment. */
  configId: number | null;
}

function GUIAssignmentBuilderRoot({ configId }: GUIAssignmentBuilderRootProps) {
  let config = useMemo(() => Config.empty(), []);
  const { data } = useQuery<{ assignmentConfig: AssignmentConfig }>(GET_PIPELINE_CONFIG_FOR_ASSIGNMENT, {
    variables: {
      assignmentConfigId: configId,
    },
  });
  if (data) {
    config = Config.fromYaml(data.assignmentConfig.config_yaml);
  }

  return (
    <LayoutProvider>
      <StoreProvider store={store}>
        <GUIAssignmentBuilder config={config} configId={configId} />
      </StoreProvider>
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
    if (!data.assignmentConfig) {
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
