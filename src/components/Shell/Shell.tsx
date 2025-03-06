"use client";

import { AppShell } from "@mantine/core";
import Nav from "@/components/Nav/Nav";
import Header from "../Header/Header";
import { useMediaQuery } from "@mantine/hooks";
import { Alert, Group, Button } from '@mantine/core';
import { useState } from 'react';
import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client'; 

export function WelcomeAlert() {
  const { user, isLoading } = useUser();
  const [showAlert, setShowAlert] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLScDUpD2aUPhupS0KbLaRrICkcMOluitA925WkdEpqvb2i-pag/viewform?usp=header";
  
  useEffect(() => {
    const isNewLogin = sessionStorage.getItem('isLoggedIn') !== 'true';
    
    if (user && !isLoading && isNewLogin) {
      sessionStorage.setItem('isLoggedIn', 'true');
      
      const timer = setTimeout(() => {
        setShowAlert(true);
        setIsLoaded(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
    
    if (!user) {
      sessionStorage.removeItem('isLoggedIn');
    }
  }, [user, isLoading]); 

  if (!user || isLoading) return null;

  return (
    <>
      {showAlert && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />
          <Alert
            title="Welcome to the Schedule Builder"
            withCloseButton={false}
            variant="filled"   
            color="blue"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 0 20px rgba(0,0,0,0.2)',
              backgroundColor: 'var(--mantine-color-blue-6)',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
              visibility: isLoaded ? 'visible' : 'hidden'
            }}
          >
          <div>
              Welcome to the Schedule Builder
            </div>
            
            <Group justify="space-between" mt="md">
              <Button 
                variant="default" 
                onClick={() => setShowAlert(false)}
              >
                Close
              </Button>
              <Group>
                <Button 
                  variant="default"
                  onClick={() => {
                    setShowAlert(false);
                  }}
                >
                  Copy Bug Report
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    window.open(formUrl, '_blank', 'noopener,noreferrer');
                    setShowAlert(false);
                  }}
                >
                  Form
                </Button>
              </Group>
            </Group>
          </Alert>
        </>
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
