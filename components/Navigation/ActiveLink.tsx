import Link from "next/link";
import { useRouter } from "next/router";

interface ActiveLinkProps {
  href: string;
  children: React.ReactNode;
}

function ActiveLink({ children, href }: ActiveLinkProps) {
  const router = useRouter();

  const semesterPrefixedUrl = (() => {
    const { semesterId } = router.query;
    const isAdmin = href.includes("admin");
    const isCourses = href.includes("courses");

    if (semesterId && isCourses) {
      return `/semesters/${semesterId}`;
    }
    if (semesterId && !isAdmin) {
      return `/semesters/${semesterId}${href}`;
    }
    return href;
  })();

  const isActive = router.pathname === semesterPrefixedUrl;
  const baseClass =
    "group flex items-center px-2 py-2.5 text-sm leading-5 font-medium rounded-md transition ease-in-out duration-150";
  const activeClass = "text-gray-900 bg-gray-200 ";
  const inactiveClass = "text-gray-700 hover:text-gray-900 hover:bg-gray-50";
  return (
    <Link href={semesterPrefixedUrl}>
      <a className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}>{children}</a>
    </Link>
  );
}

export default ActiveLink;
