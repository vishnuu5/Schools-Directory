import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { ensureSchoolsTable, listSchools, insertSchool } from "@/lib/db"
import { put } from "@vercel/blob"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const isDev = process.env.NODE_ENV !== "production"

function jsonError(fallback, err, status = 500) {
  const code = err?.code || "ERR"
  // Always include the error message and code so production shows the real reason
  const message = err?.message || fallback

  // Provide a helpful hint for common production errors
  let hint = undefined
  if (code === "DB_CONFIG_MISSING") {
    hint =
      "Set DATABASE_URL to your Neon pooled connection string on Vercel (must include sslmode=require), then redeploy."
  } else if (code === "DB_LOCALHOST_IN_PROD") {
    hint = "Do not use localhost for DATABASE_URL on Vercel. Use the Neon public pooled URL."
  } else if (code === "BLOB_NOT_CONFIGURED") {
    hint =
      "Enable Vercel Blob for this project and set USE_BLOB=true on Vercel. The integration will add BLOB_READ_WRITE_TOKEN."
  } else if (code === "BLOB_UPLOAD_FAILED") {
    hint = "Check BLOB_READ_WRITE_TOKEN and that the Vercel Blob integration is installed for this project."
  }

  return NextResponse.json({ success: false, error: message, code, hint }, { status })
}

async function saveImage(imageFile) {
  if (!imageFile || typeof imageFile !== "object" || !("name" in imageFile)) return null

  const rawName = String(imageFile.name || "upload.bin")
  const safeName = rawName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "")
  const fileName = `${Date.now()}-${safeName}`

  // Use Blob if explicitly enabled or if running on Vercel AND token exists
  const blobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN
  const useBlob = process.env.USE_BLOB === "true" || (!!process.env.VERCEL && blobConfigured)

  if (useBlob) {
    try {
      const bytes = await imageFile.arrayBuffer()
      const data = new Uint8Array(bytes)
      const options = { access: "public" }
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        // optional: SDK also reads the env var automatically, but we pass it when present
        options.token = process.env.BLOB_READ_WRITE_TOKEN
      }
      const res = await put(`schools/${fileName}`, data, options)
      return res.url
    } catch (e) {
      console.error("Blob upload error:", e)
      throw Object.assign(new Error("Failed to upload image to storage. Check Vercel Blob integration and token."), {
        code: "BLOB_UPLOAD_FAILED",
      })
    }
  }

  // In production without Blob configured, bail with a clear error (filesystem is not viable on Vercel)
  if (process.env.VERCEL) {
    throw Object.assign(
      new Error(
        "Image storage not configured in production. Enable Vercel Blob (adds BLOB_READ_WRITE_TOKEN) or set USE_BLOB=true.",
      ),
      { code: "BLOB_NOT_CONFIGURED" },
    )
  }

  // Local dev: write to public/schoolImages
  const imagesDir = path.join(process.cwd(), "public", "schoolImages")
  await fs.mkdir(imagesDir, { recursive: true })
  const dest = path.join(imagesDir, fileName)
  const bytes = await imageFile.arrayBuffer()
  await fs.writeFile(dest, Buffer.from(bytes))
  return `/schoolImages/${fileName}`
}

export async function GET() {
  try {
    await ensureSchoolsTable()
    const rows = await listSchools()
    return NextResponse.json({ success: true, data: rows })
  } catch (err) {
    if (err?.code === "DB_CONFIG_MISSING" || err?.code === "DB_LOCALHOST_IN_PROD") {
      return jsonError(err.message, err, 500)
    }
    console.error("GET /api/schools error:", err)
    return jsonError("Failed to fetch schools", err, 500)
  }
}

export async function POST(req) {
  try {
    await ensureSchoolsTable()
    const formData = await req.formData()

    const name = (formData.get("name") || "").toString().trim()
    const address = (formData.get("address") || "").toString().trim()
    const city = (formData.get("city") || "").toString().trim()
    const state = (formData.get("state") || "").toString().trim()
    const contact = (formData.get("contact") || "").toString().trim()
    const email_id = (formData.get("email_id") || "").toString().trim()
    const imageFile = formData.get("image")

    if (!name || !address || !city || !state || !contact || !email_id) {
      return NextResponse.json(
        { success: false, error: "All fields are required", code: "VALIDATION_ERROR" },
        { status: 400 },
      )
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email_id)) {
      return NextResponse.json({ success: false, error: "Invalid email", code: "INVALID_EMAIL" }, { status: 400 })
    }

    let imagePath = null
    if (imageFile) {
      imagePath = await saveImage(imageFile)
    }

    await insertSchool({ name, address, city, state, contact, image: imagePath, email_id })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err?.code === "DB_CONFIG_MISSING" || err?.code === "DB_LOCALHOST_IN_PROD") {
      return jsonError(err.message, err, 500)
    }
    console.error("POST /api/schools error:", err)
    return jsonError("Failed to add school", err, 500)
  }
}
