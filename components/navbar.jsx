import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="container-narrow py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Schools
        </Link>
        <ul className="flex items-center gap-4">
          <li>
            <Link
              href="/addSchool"
              className="text-sm text-gray-700 hover:text-black"
            >
              Add School
            </Link>
          </li>
          <li>
            <Link
              href="/showSchools"
              className="text-sm text-gray-700 hover:text-black"
            >
              Show Schools
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
