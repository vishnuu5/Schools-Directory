import Navbar from "../../components/navbar";
import ShowSchoolsGrid from "./showSchools";

export default function ShowSchoolsPage() {
  return (
    <main>
      <Navbar />
      <section className="container-narrow py-10">
        <h1 className="text-2xl font-semibold mb-6">Browse Schools</h1>
        <ShowSchoolsGrid />
      </section>
    </main>
  );
}
