import AppealStatusBadge from "@components/Appeal/AppealStatusBadge";
import { LayoutProvider } from "@contexts/layout";
import { Layout } from "@layout";
import { AppealStatus } from "@types";
import { GetServerSideProps } from "next";

function AppealDetailPage() {
  return (
    <LayoutProvider>
      <Layout title="Appeal Detail">
        <div className="p-6 w-full flex flex-col">
          <h1 className="text-2xl text-gray-900 font-bold leading-7">Appeal Details</h1>
          <div className="max-w-md mt-8 px-5 py-4 grid grid-cols-3 gap-4 bg-white text-gray-700 shadow rounded-md">
            {/* TODO(Bryan): Populate with real values from database */}
            <p className="font-medium flex self-center">Appeal Status:</p>
            <div className="col-span-2">
              <AppealStatusBadge status={AppealStatus.Outstanding} />
            </div>
            <p className="font-medium">Name:</p>
            <p className="col-span-2">LOREM, Ipsum</p>
            <p className="font-medium">SID:</p>
            <p className="col-span-2">20609999</p>
            <p className="font-medium">Email:</p>
            <a href={`mailto:`} className="col-span-2 text-cse-400 underline hover:text-cse-700 transition">
              lorem@connect.ust.hk
            </a>
          </div>
          <div className="h-full mt-4 px-5 py-4 bg-white shadow rounded-md">TODO: Add more stuff here</div>
        </div>
      </Layout>
    </LayoutProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default AppealDetailPage;
