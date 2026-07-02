import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow — Task Management",
  description:
    "A scalable task management app with JWT auth and role-based access control.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the no-flash theme script (below) sets the
    // `dark` class before React hydrates, which would otherwise mismatch.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Apply the saved theme before first paint to avoid a light→dark flash.
          Kept as a tiny inline script because it must run synchronously.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'dark' || (!t && m)) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
