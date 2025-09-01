import Navbar from "../../components/navbar";
import AddSchoolForm from "./addSchool";

export default function AddSchoolPage() {
  return (
    <main>
      <Navbar />
      <section className="container-narrow py-10">
        <h1 className="text-2xl font-semibold mb-6">Add School</h1>
        <AddSchoolForm />
      </section>
    </main>
  );
}
