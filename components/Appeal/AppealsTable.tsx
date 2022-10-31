import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppealStatus } from "@types";
import Link from "next/link";
import AppealStatusBadge from "./AppealStatusBadge";

// Temporary type to represent an appeal
// We'll later define an "appeal" type in `types/tables.ts`
type Appeal = {
  id: number;
  updatedAt: string;
  status: AppealStatus;
  name: string;
  sid: string;
  email: string;
  originalScore: number;
  finalScore?: number;
};

const dummyAppealData: Appeal[] = [
  {
    id: 1,
    updatedAt: "2022-10-30 5:00PM",
    status: AppealStatus.Outstanding,
    name: "LOREM, Ipsum",
    sid: "20609999",
    email: "lorem@connect.ust.hk",
    originalScore: 70,
  },
  {
    id: 2,
    updatedAt: "2022-10-30 4:00PM",
    status: AppealStatus.Completed,
    name: "CHAN, Tai Man Tom",
    sid: "20509999",
    email: "ctm@connect.ust.hk",
    originalScore: 80,
    finalScore: 100,
  },
  {
    id: 3,
    updatedAt: "2022-10-30 3:00PM",
    status: AppealStatus.Rejected,
    name: "CHEUNG, Siu Ming",
    sid: "20409999",
    email: "cmm@connect.ust.hk",
    originalScore: 80,
    finalScore: 80,
  },
];

/** Table that summarizes all grade appeals. */
function AppealsTable() {
  return (
    <div className="shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-cool-gray-200">
        <thead className="bg-cool-gray-100 text-xs leading-4 text-cool-gray-500 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3 font-medium text-left">Last Updated</th>
            <th className="px-5 py-3 font-medium text-left">Status</th>
            <th className="px-5 py-3 font-medium text-left">Name</th>
            <th className="px-5 py-3 font-medium text-left">SID</th>
            <th className="px-5 py-3 font-medium text-left">Email</th>
            <th className="px-5 py-3 font-medium text-left">Original Score</th>
            <th className="px-5 py-3 font-medium text-left">Final Score</th>
            <th className="pr-3 py-3 font-medium text-left"></th>
          </tr>
        </thead>
        <tbody className="bg-white text-sm text-cool-gray-700 divide-y divide-cool-gray-200">
          {dummyAppealData.map((appeal) => (
            <AppealsTableRow key={appeal.id} appeal={appeal} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppealsTableRow({ appeal }: { appeal: Appeal }) {
  return (
    <tr>
      <td className="px-5 py-3">{appeal.updatedAt}</td>
      <td className="px-5 py-3">
        <AppealStatusBadge status={appeal.status} />
      </td>
      <td className="px-5 py-3">{appeal.name}</td>
      <td className="px-5 py-3">{appeal.sid}</td>
      <td className="px-5 py-3">
        <a href={`mailto:${appeal.email}`} className="text-cse-300 underline hover:text-cse-600 transition">
          {appeal.email}
        </a>
      </td>
      <td className="px-5 py-3">{appeal.originalScore}</td>
      <td className="px-5 py-3">{appeal.finalScore ?? "-"}</td>
      <td className="pr-3 py-3">
        <Link href={`/appeals/${appeal.id}`} passHref>
          <a className="p-2 text-cool-gray-500 text-lg rounded-full hover:bg-cool-gray-100">
            <FontAwesomeIcon icon={["fas", "arrow-right"]} />
          </a>
        </Link>
      </td>
    </tr>
  );
}

export default AppealsTable;
