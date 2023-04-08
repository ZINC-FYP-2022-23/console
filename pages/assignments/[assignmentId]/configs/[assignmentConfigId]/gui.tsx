import GUIAssignmentBuilder from "@/components/GuiBuilder/GuiBuilder";
import { LayoutProvider } from "@/contexts/layout";
import { GET_PIPELINE_CONFIG_FOR_ASSIGNMENT } from "@/graphql/queries/user";
import { Layout } from "@/layout";
import { initializeApollo } from "@/lib/apollo";
import { guiBuilderModel } from "@/store/GuiBuilder";
import { Assignment, AssignmentConfig } from "@/types/tables";
import { useQuery } from "@apollo/client";
import { StoreProvider, createStore } from "easy-peasy";
import { GetServerSideProps } from "next";
import { useMemo } from "react";

interface GUIAssignmentBuilderRootProps {
  /** The `assignmentConfigId`. If it's `-1`, it means we're creating a new assignment. */
  configId: number;
  /** The assignment ID. */
  assignmentId: number;
}

function GUIAssignmentBuilderRoot({ configId, assignmentId }: GUIAssignmentBuilderRootProps) {
  const guiBuilderStore = useMemo(() => createStore(guiBuilderModel), []);

  const { data, error } = useQuery<{ assignmentConfig: AssignmentConfig; assignment: Assignment }>(
    GET_PIPELINE_CONFIG_FOR_ASSIGNMENT,
    {
      variables: {
        assignmentConfigId: configId,
        assignmentId,
      },
    },
  );

  // TODO(Anson): Better handling of error
  if (error) {
    console.error(error);
  }

  return (
    <LayoutProvider>
      <Layout title="Assignment Config">
        <StoreProvider store={guiBuilderStore}>
          <GUIAssignmentBuilder data={data} configId={configId === -1 ? null : configId} />
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
  let assignmentId: string | number = query.assignmentId as string;

  const isNew = configId === "new";
  configId = isNew ? -1 : parseInt(configId);
  assignmentId = parseInt(assignmentId);
  if (isNaN(configId) || isNaN(assignmentId)) {
    return { notFound: true };
  }

  const { data } = await apolloClient.query({
    query: GET_PIPELINE_CONFIG_FOR_ASSIGNMENT,
    variables: {
      assignmentId,
      assignmentConfigId: configId,
    },
  });
  if (data.assignment === null || (!isNew && data.assignmentConfig === null)) {
    return { notFound: true };
  }

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      configId,
      assignmentId,
    },
  };
};

export default GUIAssignmentBuilderRoot;
