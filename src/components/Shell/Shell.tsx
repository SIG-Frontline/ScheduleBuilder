"use client";

import { AppShell } from "@mantine/core";
import Nav from "@/components/Nav/Nav";
import Header from "../Header/Header";
import { useMediaQuery } from "@mantine/hooks";
import { Button, Modal } from '@mantine/core';
import { useState } from 'react';
import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/'; 
import { create } from "domain";
import React, { createContext } from "react";

export const WelcomeModal =  createContext<{ isOpen: boolean }>({ isOpen: false});

export function WelcomeAlert({ isOpen, onClose}: { isOpen: boolean, onClose:() => void}) {
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome === "true") {
      setShowAlert(false);
    }
    
    if (!hasSeenWelcome) {
        setShowAlert(true);
    }
  },); 

  return (
    <>
      {showAlert && (
          <Modal
        title={
          <div className="text-1xl font-semibold tracking-tight text-neutral-750">
            Welcome to Frontline-Lynk Schedule Builder
          </div>
        }
        opened={showAlert}
        withCloseButton={false}
        trapFocus={true}
        closeOnClickOutside={false}
        closeOnEscape={false}
        onClose={() => {}}
      >
        <p className="text-sm mb-4">
          Created by NJIT Students, for NJIT Students. As development is ongoing, some features may be incomplete. We welcome your feedback via the top-right menu.
        </p>
        <p className="text-sm mb-4">          
          All information is sourced from the official{" "}
          <a
          href="https://catalog.njit.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
          >
           NJIT Catalog
          </a>
          {" "}and{" "}
          <a
          href="https://generalssb-prod.ec.njit.edu/BannerExtensibility/customPage/page/stuRegCrseSched"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
          >
            Course Schedule.
          </a>
        </p>
        <div className="flex items-center justify-center gap-8">
          <Button
            size="md"
            w="100%"
            variant="dark"
            color="blue"
            onClick={() => {
              localStorage.setItem("hasSeenWelcome", "true");
              setShowAlert(false);
            }} 
          >
            Close
          </Button>
        </div>
      </Modal>
      )}
    </>
  );
}

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
        {matches === true ? (
          <AppShell.Aside>
            <Nav />
          </AppShell.Aside>
        ) : null}

        <AppShell.Main
          style={{
            maxHeight: "100dvh", // using dvh unit above to factor in the mobile browser address bar
            minWidth: "50em",
          }}
        >
          <div className="flex flex-col h-[calc(100dvh_-_60px)]">
            {/* using dvh unit above to factor in the mobile browser address bar*/}
            <div className="flex-grow">{children} </div>
            <div className="h-max w-screen sticky left-0">
              {matches === false && <Nav />}{" "}
              {/* matches === false is intentional, !matches would be true if matches is undefined */}
            </div>
          </div>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
