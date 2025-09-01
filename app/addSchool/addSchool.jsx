"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSchoolForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      contact: "",
      email_id: "",
      image: null,
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("name", data.name);
      form.append("address", data.address);
      form.append("city", data.city);
      form.append("state", data.state);
      form.append("contact", data.contact);
      form.append("email_id", data.email_id);
      if (data.image && data.image[0]) {
        form.append("image", data.image[0]);
      }

      const res = await fetch("/api/schools", {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add school");
      }

      reset();
      alert("School added successfully!");
      router.push("/showSchools");
    } catch (e) {
      console.error(e);
      alert(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const imageFile = watch("image");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">School Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Springfield High"
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "Too short" },
            })}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., info@school.org"
            {...register("email_id", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email",
              },
            })}
          />
          {errors.email_id && (
            <p className="text-sm text-red-600">{errors.email_id.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium">Address</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Street, Area"
            {...register("address", {
              required: "Address is required",
              minLength: { value: 3, message: "Too short" },
            })}
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">City</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Mumbai"
            {...register("city", { required: "City is required" })}
          />
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">State</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Maharashtra"
            {...register("state", { required: "State is required" })}
          />
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium">Contact Number</label>
          <input
            type="tel"
            inputMode="numeric"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 9876543210"
            {...register("contact", {
              required: "Contact is required",
              pattern: { value: /^[0-9]{7,15}$/, message: "Use 7-15 digits" },
            })}
          />
          {errors.contact && (
            <p className="text-sm text-red-600">{errors.contact.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium">School Image</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border rounded px-3 py-2 bg-white"
            {...register("image")}
          />
          <p className="text-xs text-gray-500">
            Optional. JPG/PNG recommended. Will be saved in public/schoolImages.
          </p>
          {imageFile && imageFile[0] && (
            <p className="text-xs text-gray-600 mt-1">
              Selected: {imageFile[0].name}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700 transition disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save School"}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-2.5 hover:bg-gray-50 transition"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
