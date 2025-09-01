"use client";

import useSWR from "swr";
import SchoolCard from "../../components/school-card";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ShowSchoolsGrid() {
  const { data, error, isLoading } = useSWR("/api/schools", fetcher);

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded">
        Failed to load schools. Try refreshing.
      </div>
    );
  }
  if (isLoading || !data) {
    return <p className="text-gray-600">Loading schools...</p>;
  }
  const items = data.data || [];
  if (items.length === 0) {
    return (
      <div className="p-4 border border-gray-200 bg-gray-50 rounded">
        No schools found. Add one from the Add School page.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <SchoolCard key={s.id} school={s} />
      ))}
    </div>
  );
}
