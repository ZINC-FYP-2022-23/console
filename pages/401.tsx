import Image from "next/image";
import Logo from "../components/Logo";

function Unauthorized() {
  return (
    <div className="bg-gray-50 h-screen w-screen flex justify-center items-center px-4">
      <div className="bg-white md:w-1/2 md:max-w-3xl min-w-min-content rounded-lg shadow p-6">
        <span className="flex">
          <Logo />
          <h1 className="ml-4 mt-2 md:text-3xl text-2xl leading-8 font-extrabold tracking-tight text-gray-900 mb-4">
            Unauthorized Access
          </h1>
        </span>
        <div className="flex justify-between items-center">
          <div>
            <p className="md:text-xl text-base leading-7 text-gray-500 mr-10">
              You do not have enough permission to access this system. If you believe this is a mistake, please contact
              system administrator for assistance.
            </p>
            <span className="mt-6 inline-flex rounded-md shadow-sm">
              <a
                href="mailto:support@zinc.cse.ust.hk"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-cse-600 hover:bg-cse-500 focus:outline-none focus:border-cse-700 focus:shadow-outline-indigo active:bg-cse-700 transition ease-in-out duration-150"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Contact Us
              </a>
            </span>
          </div>
          <div className="md:h-48 h-32">
            <Image src="/assets/vault.svg" alt="vault" layout="fixed" width={176} height={192} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async ({ res }) => {
  res.statusCode = 401;
  return {
    props: {},
  };
};

export default Unauthorized;
