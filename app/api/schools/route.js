import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { ensureSchoolsTable, listSchools, insertSchool } from "@/lib/db";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isDev = process.env.NODE_ENV !== "production";

function jsonError(fallback, err, status = 500) {
  const message =
    isDev && err && (err.message || err.code)
      ? `[${err.code || "ERR"}] ${err.message}`
      : fallback;
  return NextResponse.json({ success: false, error: message }, { status });
}

async function saveImage(imageFile) {
  if (!imageFile || typeof imageFile !== "object" || !("name" in imageFile))
    return null;

  const rawName = String(imageFile.name || "upload.bin");
  const safeName = rawName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "");
  const fileName = `${Date.now()}-${safeName}`;

  const useBlob = !!process.env.VERCEL || process.env.USE_BLOB === "true";

  if (useBlob) {
    try {
      const bytes = await imageFile.arrayBuffer();
      const res = await put(`schools/${fileName}`, new Uint8Array(bytes), {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return res.url;
    } catch (e) {
      console.error("Blob upload error:", e);
      throw Object.assign(
        new Error(
          "Failed to upload image to storage. Check Vercel Blob integration and token."
        ),
        {
          code: "BLOB_UPLOAD_FAILED",
        }
      );
    }
  }

  // Local dev: write to public/schoolImages
  const imagesDir = path.join(process.cwd(), "public", "schoolImages");
  await fs.mkdir(imagesDir, { recursive: true });
  const dest = path.join(imagesDir, fileName);
  const bytes = await imageFile.arrayBuffer();
  await fs.writeFile(dest, Buffer.from(bytes));
  return `/schoolImages/${fileName}`;
}

export async function GET() {
  try {
    await ensureSchoolsTable();
    const rows = await listSchools();
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    if (
      err?.code === "DB_CONFIG_MISSING" ||
      err?.code === "DB_LOCALHOST_IN_PROD"
    ) {
      return jsonError(err.message, err, 500);
    }
    console.error("GET /api/schools error:", err);
    return jsonError("Failed to fetch schools", err, 500);
  }
}

export async function POST(req) {
  try {
    await ensureSchoolsTable();
    const formData = await req.formData();

    const name = (formData.get("name") || "").toString().trim();
    const address = (formData.get("address") || "").toString().trim();
    const city = (formData.get("city") || "").toString().trim();
    const state = (formData.get("state") || "").toString().trim();
    const contact = (formData.get("contact") || "").toString().trim();
    const email_id = (formData.get("email_id") || "").toString().trim();
    const imageFile = formData.get("image");

    if (!name || !address || !city || !state || !contact || !email_id) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_id)) {
      return NextResponse.json(
        { success: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    let imagePath = null;
    if (imageFile) {
      imagePath = await saveImage(imageFile);
    }

    await insertSchool({
      name,
      address,
      city,
      state,
      contact,
      image: imagePath,
      email_id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (
      err?.code === "DB_CONFIG_MISSING" ||
      err?.code === "DB_LOCALHOST_IN_PROD"
    ) {
      return jsonError(err.message, err, 500);
    }
    console.error("POST /api/schools error:", err);
    return jsonError("Failed to add school", err, 500);
  }
}
