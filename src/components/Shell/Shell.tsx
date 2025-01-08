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
    <>
      <AppShell
        aside={{ width: 350, breakpoint: "lg" }}
        header={{ height: 60 }}
      >
        <AppShell.Header>
          <Header />
        </AppShell.Header>
        {/* {matches ? (
        <AppShell.Aside>
          <Nav />
        </AppShell.Aside>
      ) : (
        <AppShell.Footer>
          <Nav />
        </AppShell.Footer>
      )} */}
        {matches ? (
          <AppShell.Aside>
            <Nav />
          </AppShell.Aside>
        ) : null}

        <AppShell.Main
          style={{
            maxHeight: "100vh",
            minWidth: "50em",
          }}
        >
          <div className="flex flex-col h-[calc(100vh_-_60px)]">
            <div className="flex-grow">{children} </div>
            <div className="h-max w-screen sticky left-0">
              {!matches && <Nav />}
            </div>
          </div>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
