import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getDb, ensureSchoolsTable } from "@/lib/db";

export const runtime = "nodejs";

const isDev = process.env.NODE_ENV !== "production";

function jsonError(fallback, err, status = 500) {
  const message =
    isDev && err && (err.message || err.code)
      ? `[${err.code || "ERR"}] ${err.message}`
      : fallback;
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET() {
  try {
    await ensureSchoolsTable();
    const db = getDb();
    const [rows] = await db.query(
      "SELECT id, name, address, city, image FROM schools ORDER BY id DESC"
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    if (err?.code === "DB_CONFIG_MISSING") {
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

    // Save image to /public/schoolImages
    let imagePath = null;
    if (imageFile && typeof imageFile === "object" && "name" in imageFile) {
      const imagesDir = path.join(process.cwd(), "public", "schoolImages");
      await fs.mkdir(imagesDir, { recursive: true });
      const rawName = String(imageFile.name || "upload.bin");
      const safeName = rawName
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9.\-_]/g, "");
      const fileName = `${Date.now()}-${safeName}`;
      const dest = path.join(imagesDir, fileName);

      try {
        const bytes = await imageFile.arrayBuffer();
        await fs.writeFile(dest, Buffer.from(bytes));
        imagePath = `/schoolImages/${fileName}`;
      } catch (e) {
        console.error("Image write error:", e);
        return jsonError(
          "Failed to save image to disk. Use a storage service in serverless environments.",
          e,
          500
        );
      }
    }

    const db = getDb();
    await db.query(
      "INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, address, city, state, contact, imagePath, email_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err?.code === "DB_CONFIG_MISSING") {
      return jsonError(err.message, err, 500);
    }
    console.error("POST /api/schools error:", err);
    return jsonError("Failed to add school", err, 500);
  }
}
