# Schools Directory (Next.js + MySQL)

A mini-project fulfilling the Web Development Assignment requirements:

- Page 1: addSchool.jsx — a responsive form (react-hook-form) to add schools into MySQL and store the image in `public/schoolImages`.
- Page 2: showSchools.jsx — a responsive grid showing schools like an e-commerce listing (name, address, city, image).

Tech stack: Next.js (App Router, JavaScript only), Tailwind CSS, MySQL, react-hook-form, SWR.

## Features

- Client-side validation with react-hook-form (required fields, email format, numeric contact).
- Server-side validation in API route for safety.
- Image upload to local folder `public/schoolImages` with unique filenames.
- MySQL connection pool using `mysql2/promise`.
- API endpoints:
  - `POST /api/schools` — create school with multipart form-data.
  - `GET /api/schools` — list schools (id, name, address, city, image).
- Responsive UI using TailwindCSS.

**Git Clone**

```bash
https://github.com/vishnuu5/Schools-Directory.git
```

**Project-Demo**

---

[Show-Demo]()

## MySQL Setup

1. Create a database (e.g., `schools_db`).
2. Run the SQL script:
   - File: `scripts/init-db.sql`
   - This creates the `schools` table with fields:
     - `id` INT AUTO_INCREMENT PRIMARY KEY
     - `name` TEXT
     - `address` TEXT
     - `city` TEXT
     - `state` TEXT
     - `contact` VARCHAR(20)
     - `image` TEXT (relative path like `/schoolImages/123.jpg`)
     - `email_id` TEXT
     - `created_at` TIMESTAMP

Note on `contact`: The spec says "number". Using VARCHAR avoids issues with leading zeros and international formats.

## Environment Variables

Copy `.env.example` to `.env.local` and set values:

\`\`\`
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=schools_db
DATABASE_PORT=3306
\`\`\`

## Installation

1. Install dependencies:

   - npm: `npm install`

2. Run dev server:

   - `npm run dev`
   - Open http://localhost:3000

3. Pages:
   - Add: http://localhost:3000/addSchool
   - List: http://localhost:3000/showSchools

## Image Storage Notes (Important)

- Local development: images are saved to `public/schoolImages`, and served from `/schoolImages/...`.
- Serverless hosting (e.g., Vercel): writing to the filesystem at runtime is not supported.
  - For production hosting, replace disk writes with a cloud storage provider (e.g., Vercel Blob, S3, etc.) and store the returned URL in the `image` field.
  - The current implementation is ideal for local testing or a serverful environment.

## Deploy

- GitHub:
  - Create a public repo and push this project.
- Hosting (Vercel recommended):
  - Add environment variables in the project settings (DATABASE\_\*).
  - For images on Vercel: switch to a blob/storage solution before deployment as noted above.

## Accessibility and Responsiveness

- Labels are linked to inputs; inputs have clear focus styles.
- Cards have alt text for images.
- Layouts use mobile-first responsive classes.

## License

Educational/assignment use.

```ext file="public/schoolImages/.gitkeep" url="/placeholder.txt"

```
