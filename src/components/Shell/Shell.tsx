"use client";

import { AppShell } from "@mantine/core";
import Nav from "@/components/Nav/Nav";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Footer>
        <Nav />
      </AppShell.Footer>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
