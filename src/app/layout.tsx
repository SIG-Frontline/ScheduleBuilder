import type { Metadata, Viewport } from "next";
import "./globals.css";

// All packages except `@mantine/hooks` require styles imports
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

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import Shell from "@/components/Shell/Shell";
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
  // metadataBase: new URL("http://localhost:3000"),
  manifest: "/manifest.webmanifest",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider>
          <div style={{ overflow: "auto" }}>
            <Shell>{children}</Shell>
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
