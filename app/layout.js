import "./globals.css";

export const metadata = {
  title: "Schools Directory",
  description: "Add and browse schools - Assignment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white text-gray-900"
      >
        {children}
      </body>
    </html>
  );
}
