import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import Logo from "../components/Logo";

function NotFound404() {
  return (
    <div className="bg-gray-50 h-screen w-screen flex justify-center items-center px-4">
      <div className="bg-white md:w-1/2 md:max-w-3xl min-w-min-content rounded-lg shadow p-6">
        <span className="flex">
          <Logo />
          <h1 className="ml-4 mt-2 md:text-3xl text-2xl leading-8 font-extrabold tracking-tight text-gray-900 mb-4">
            Page Not Found
          </h1>
        </span>
        <div className="flex justify-between items-center">
          <div>
            <p className="md:text-xl text-base leading-7 text-gray-500 mr-10">
              The page you requested could not be found. If you believe this is a mistake, please contact system
              administrator for assistance.
            </p>
            <div className="mt-6 flex gap-4">
              <Link href="/">
                <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-cse-600 hover:bg-cse-500 focus:outline-none focus:border-cse-700 focus:shadow-outline-indigo active:bg-cse-700 transition ease-in-out duration-150">
                  <FontAwesomeIcon icon={["fas", "house"]} className="mr-2" />
                  <span>Back to Home</span>
                </a>
              </Link>
              <a
                href="mailto:support@zinc.cse.ust.hk"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-cse-700 bg-blue-100 hover:bg-blue-50 focus:outline-none focus:border-cse-700 focus:shadow-outline-indigo active:bg-blue-200 transition ease-in-out duration-150"
              >
                <FontAwesomeIcon icon={["fas", "envelope"]} className="mr-2" />
                <span>Contact Us</span>
              </a>
            </div>
          </div>
          <div className="md:h-48 h-32">
            <Image src="/assets/404.svg" alt="vault" layout="fixed" width={176} height={192} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound404;
