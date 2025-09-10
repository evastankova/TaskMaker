import "./styles.css";

export const metadata = {
  title: "Task Maker",
  description: "Manage your tasks easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b bg-white">
          <nav className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-6">
            <a href="/" className="font-semibold">Task Maker</a>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-8">
          {children}
        </main>

        <footer className="mx-auto max-w-5xl px-6 py-10 text-sm text-gray-500">
          © {new Date().getFullYear()} Task Maker
        </footer>
      </body>
    </html>
  );
}