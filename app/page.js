import Link from "next/link";
import Navbar from "../components/navbar";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <section className="container-narrow py-12">
        <h1 className="text-3xl font-semibold mb-4 text-balance">
          Schools Directory
        </h1>
        <p className="text-gray-600 mb-8">
          Use this mini app to add schools with details and view them in a
          responsive grid.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/addSchool"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-5 py-3 hover:bg-blue-700 transition"
          >
            Add a School
          </Link>
          <Link
            href="/showSchools"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-3 hover:bg-gray-50 transition"
          >
            Browse Schools
          </Link>
        </div>

        <div className="mt-10 p-4 bg-blue-50 border border-blue-100 rounded">
          <p className="text-sm text-blue-900">
            Tip: Configure your MySQL connection in .env and run the SQL
            script in scripts/init-db.sql.
          </p>
        </div>
      </section>
    </main>
  );
}
