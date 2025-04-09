import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "material-symbols";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/code-highlight/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/nprogress/styles.css";
import { Notifications } from "@mantine/notifications";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import Shell from "@/components/Shell/Shell";
import { getBackendStatus } from "@/lib/server/actions/getBackendStatus";
import BackendOfflineMessage from "@/components/BackendOffline/BackendOfflineMessage";
export const viewport: Viewport = {
  themeColor: "#1c7ed6",
  initialScale: 1,
  height: "device-height",
  width: "device-width",
};
export const metadata: Metadata = {
  title: "Schedule Builder",
  description: "Schedule Builder for SIG-Frontline",
  // favicon: "/frontline.png",
  icons: {
    apple: "/frontline.png",
    icon: "/frontline.png",
    shortcut: "/frontline.png",
  },

  manifest: "/manifest.json",
  openGraph: {
    images: [
      {
        url: "/api/og-img",
        width: 1200,
        height: 600,
        alt: "Schedule Builder for SIG-Frontline",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const backendStatus = await getBackendStatus();

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <UserProvider>
          <MantineProvider>
        {backendStatus ? (
            <Notifications />
            <div style={{ overflow: "auto" }}>
              <Shell>{children}</Shell>
            </div>
          ) : (
                <BackendOfflineMessage />
              )}
          </MantineProvider>
        </UserProvider>
      </body>
    </html>
  );
}
