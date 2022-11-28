import { useQuery } from "@apollo/client";
import GUIAssignmentBuilder from "@components/GuiBuilder/GuiBuilder";
import { LayoutProvider } from "@contexts/layout";
import { GET_PIPELINE_CONFIG_FOR_ASSIGNMENT } from "@graphql/queries/user";
import { Layout } from "@layout";
import { initializeApollo } from "@lib/apollo";
import { MantineProvider, MantineThemeOverride } from "@mantine/core";
import { GuiBuilderStoreProvider } from "@state/GuiBuilder/Store";
import { Assignment, AssignmentConfig } from "@types";
import { GetServerSideProps } from "next";
import defaultTheme from "tailwindcss/defaultTheme";

/**
 * Custom Mantine theme for the GUI Assignment Builder.
 */
const mantineTheme: MantineThemeOverride = {
  colors: {
    blue: ["#8FADE0", "#6F95D8", "#4F7ECF", "#3560C0", "#2C56A0", "#234580", "#1B3663", "#162B50", "#122340"],
  },
  fontFamily: `Inter var, ${defaultTheme.fontFamily.sans.join(", ")}`,
};

interface GUIAssignmentBuilderRootProps {
  /** The `assignmentConfigId`. If it's `-1`, it means we're creating a new assignment. */
  configId: number;
  /** The assignment ID. */
  assignmentId: number;
}

function GUIAssignmentBuilderRoot({ configId, assignmentId }: GUIAssignmentBuilderRootProps) {
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
        <MantineProvider theme={mantineTheme}>
          <GuiBuilderStoreProvider>
            <GUIAssignmentBuilder data={data} configId={configId} />
          </GuiBuilderStoreProvider>
        </MantineProvider>
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
