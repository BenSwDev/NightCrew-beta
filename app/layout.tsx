"use client";

import "../styles/globals.css";
import Providers from "./Providers";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect unauthenticated users to the login page
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <html>
        <body>
          <main style={{ textAlign: "center", marginTop: "20vh" }}>
            <h1>Loading...</h1>
          </main>
        </body>
      </html>
    );
  }

  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
