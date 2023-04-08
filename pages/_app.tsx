import { ApolloProvider } from "@apollo/client";
import { parse } from "cookie";
import { config as faConfig, library, IconPack } from "@fortawesome/fontawesome-svg-core";
import { fad } from "@fortawesome/pro-duotone-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { useApollo } from "../lib/apollo";
import { ZincProvider } from "../contexts/zinc";
import "react-nice-dates/build/style.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-gh-like-diff/dist/css/diff2html.min.css";
import "../styles/index.css";
import { getUserRole } from "../utils/user";
import Unauthorized from "../pages/401";
import toast from "react-hot-toast";
import { Notification, NotificationBody } from "../components/Notification";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { MantineProvider, MantineThemeOverride } from "@mantine/core";
import { Tuple } from "@mantine/styles";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../tailwind.config";

faConfig.autoAddCss = false;
library.add(fad, far, fas as IconPack);

const fullTailwindConfig = resolveConfig(tailwindConfig);

/**
 * Custom [Mantine theme](https://mantine.dev/theming/theme-object/) that is based on our Tailwind theme.
 */
const mantineTheme: MantineThemeOverride = {
  colors: {
    blue: Object.values(fullTailwindConfig.theme?.colors?.["cse"]) as Tuple<string, 10>,
  },
  fontFamily: fullTailwindConfig.theme?.fontFamily?.["sans"],
  fontFamilyMonospace: fullTailwindConfig.theme?.fontFamily?.["mono"],
};

function ZincApp({ Component, pageProps, cookie, hasTeachingRole, isAdmin, user, itsc, semester }) {
  let initialApolloState = {};
  if (pageProps) {
    initialApolloState = pageProps.initialApolloState;
  }
  const client = useApollo(cookie, initialApolloState);
  if (!hasTeachingRole && !isAdmin) {
    return <Unauthorized />;
  }
  try {
    return (
      <ApolloProvider client={client}>
        <ZincProvider isAdmin={isAdmin} user={user} itsc={itsc} semester={semester}>
          <MantineProvider theme={mantineTheme}>
            <Component {...pageProps} />
          </MantineProvider>
        </ZincProvider>
      </ApolloProvider>
    );
  } catch (error: any) {
    toast.custom((t) => (
      <Notification trigger={t}>
        <NotificationBody title={"Error"} body={error.message} success={false} id={t.id} />
      </Notification>
    ));
  }
}

ZincApp.getInitialProps = async ({ ctx }) => {
  const { user, semester, itsc } = parse(ctx.req.headers.cookie);
  const { hasTeachingRole, isAdmin } = await getUserRole(parseInt(user, 10));
  return {
    cookie: ctx.req.headers.cookie,
    hasTeachingRole,
    isAdmin,
    itsc,
    user: parseInt(user, 10),
    semester: parseInt(semester, 10),
  };
};

export default ZincApp;
