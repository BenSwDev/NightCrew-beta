// app/layout.tsx

import "../styles/globals.css";
import Providers from "./Providers";

export const metadata = {
  title: "NightCrew",
  description: "Connecting job seekers with nightlife venues",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  themeColor: "#512da8",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NightCrew",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
