"use client";

import { AppShell, Button, Modal } from "@mantine/core";
import Nav from "@/components/Nav/Nav";
import Header from "../Header/Header";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect } from "react";
import { uuidv4 } from "@/lib/uuidv4";
import { useSearchParams } from "next/navigation";
import { Course, planStore, syncPlans } from "@/lib/client/planStore";
import { getSectionDataByCrn } from "@/lib/server/actions/getSectionDataByCrn";
import { notifications } from "@mantine/notifications";
import React, { createContext, useState } from "react";

export const WelcomeModal = createContext<{ isOpen: boolean }>({
  isOpen: false,
});

export function WelcomeAlert({}: { isOpen: boolean; onClose: () => void }) {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome === "true") {
      setShowAlert(false);
    }

    if (!hasSeenWelcome) {
      setShowAlert(true);
    }
  });

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
            Created by NJIT Students, for NJIT Students. As development is
            ongoing, some features may be incomplete. We welcome your feedback
            via the top-right menu.
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
            </a>{" "}
            and{" "}
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
  const addPlan = planStore().addPlan;
  const addCourseToPlan = planStore((state) => state.addCourseToPlan);
  const searchParams = useSearchParams();
  useEffect(() => {
    const importPlanFromURL = async () => {
      await fetch("/auth/profile");

      const queryName = searchParams.get("name") ?? "Imported Plan";
      const queryTerm = searchParams.get("term") ?? "202510";
      const newUuid = uuidv4();
      // TODO: Since this map is converted to an array whenever it is used, it shouldn't be a map to begin with. Rather a 2D array.
      const crnValues = new Map();
      const crnRegex = /crn\d+/;

      console.log("Search Params:");
      console.log(searchParams);

      searchParams.forEach((value, key) => {
        if (crnRegex.test(key)) {
          if (key.includes("f")) crnValues.set(value, false);
          else crnValues.set(value, true);
        }
      });
      /*
        Sorting the crn values here ensures that they are in the correct order when eventually paired with their courses in getSectionByCrn.
        This is far from a perfect solution although I doubt this would change.
        Right now this pairing of CRN values to courses relies on the fact that the order in which courses are returned from the database is also the order in which CRN's are paired with courses.
        That is to say, CRN values in ascending order happen to match the order in which the courses are returned.
        */
      const sortedCrnValues = new Map(
        [...crnValues.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))
      );
      const crnValueArray: string[] = Array.from(sortedCrnValues.values());
      const queryPlan = {
        uuid: newUuid,
        name: queryName,
        description: "This is an imported plan",
        term: parseInt(queryTerm, 10),
        courses: [],
        events: [],
        selected: true,
        isTemporary: true,
      };
      console.log(`Adding plan: ${queryPlan}`);
      addPlan(queryPlan);
      localStorage.setItem("temporaryPlan", "true");
      localStorage.setItem("lastSelectedPlanUUID", newUuid);
      getSectionDataByCrn(window.location.search).then((data) => {
        data.forEach((course: Course) => {
          course.color = `rgba(
                                    ${Math.floor(Math.random() * 256)},
                                    ${Math.floor(Math.random() * 256)},
                                    ${Math.floor(Math.random() * 256)},0.9)`;
          addCourseToPlan(course);
          queryPlan.courses.push(course);
        });
      });
      // planStore().selectPlan(queryPlan.uuid);
      notifications.show({
        title: 'Previewing: "' + queryName + '"',
        message: (
          <div>
            <p>
              Any changes will not be saved unless you add it to your list of
              plans.
            </p>
            <div className="flex justify-evenly">
              <Button
                onClick={() => {
                  queryPlan.isTemporary = false;
                  planStore.getState().updatePlan(queryPlan, queryPlan.uuid);
                  syncPlans();
                  notifications.clean();
                }}
              >
                Save This Plan
              </Button>
            </div>
          </div>
        ),
        autoClose: false, // Keeps the notification open until dismissed
        position: "bottom-right",
      });
      // This clears the URL parameters so that refreshing the page does not re-add the plan:
      window.history.replaceState({}, document.title, "/");
    };

    if (searchParams.get("name")) {
      importPlanFromURL();
    }
  }, []);
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
