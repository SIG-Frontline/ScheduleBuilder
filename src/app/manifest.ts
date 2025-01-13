import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Schedule Builder",
    short_name: "Schedule Builder",
    description: "A schedule builder for students",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    icons: [
      {
        src: "/icon.svg",
        sizes: "480x480",
        type: "image/svg+xml",
      },
    ],
  };
}
