"use client";

import { AppShell } from "@mantine/core";
import Nav from "@/components/Nav/Nav";
import Header from "../Header/Header";
import { useMediaQuery } from "@mantine/hooks";

export default function Shell({ children }: { children: React.ReactNode }) {
  const matches = useMediaQuery(
    "only screen and (orientation: landscape) and (min-width: 1201px)"
  );
  return (
    <AppShell
      aside={{ width: 350, breakpoint: "lg" }}
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      {matches ? (
        <AppShell.Aside>
          <Nav />
        </AppShell.Aside>
      ) : (
        <AppShell.Footer>
          <Nav />
        </AppShell.Footer>
      )}

      <AppShell.Main
        style={{
          maxHeight: "calc(100vh - 60px - 656px)",
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
