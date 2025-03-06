"use client";

import { AppShell } from "@mantine/core";
import Nav from "@/components/Nav/Nav";
import Header from "../Header/Header";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect } from "react";
import { planStore } from "@/lib/client/planStore";
import { getSectionByCrn } from "@/lib/server/actions/getSectionByCrn";
import { useSearchParams } from "next/navigation";
import { getSectionData } from "@/lib/server/actions/getSectionData";
import { notifications } from "@mantine/notifications";
import { Button } from "@mantine/core";

export default function Shell({ children }: { children: React.ReactNode }) {
  const addPlan = planStore().addPlan;
  const addTempPlan = planStore().addTempPlan;
  const addCourseToPlan = planStore((state) => state.addCourseToPlan);
  const selectSection = planStore((state) => state.selectSection);

  function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (
        +c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
      ).toString(16)
    );
  }
  const searchParams = useSearchParams();

  useEffect(() => {
    // const searchParams = new URLSearchParams(window.location.search);
    const importPlanFromURL = async () => {
      const queryName = searchParams.get("name") ?? "Imported Plan";
      const queryTerm = searchParams.get("term") ?? "0";
      const newUuid = uuidv4();
      const courseValues: Array<string> = [];
      const courseRegex = /course\d+/;
      const crnValues: Array<string> = [];
      const crnRegex = /crn\d+/;

      searchParams.forEach((value, key) => {
        if (crnRegex.test(key)) {
          crnValues.push(value);
        }
        if (courseRegex.test(key)) {
          courseValues.push(value);
        }
      });

      const queryPlan = {
        uuid: newUuid,
        name: queryName,
        description: "This is an imported plan",
        term: parseInt(queryTerm, 10),
        courses: [],
        events: [],
        selected: true,
        crns: crnValues,
      };

      // console.log(queryPlan);
      addTempPlan(queryPlan);

      const crnCodeMap = new Map();
      crnValues.forEach((thisCrn) => {
        getSectionByCrn(parseInt(queryTerm), thisCrn).then((data) => {
          data.color = `rgba(
                                ${Math.floor(Math.random() * 256)},
                                ${Math.floor(Math.random() * 256)},
                                ${Math.floor(Math.random() * 256)},0.9)`;
          addCourseToPlan(data);
          crnCodeMap.set(data.code, thisCrn);
          selectSection(data.code, thisCrn);
          queryPlan.courses.push(data);
        });
      });
      courseValues.forEach((thisCourse) => {
        let courseName = thisCourse.replace(/[0-9\s]/g, "");
        let courseCode = thisCourse.replace(/[a-zA-Z\s]/g, "");
        getSectionData(parseInt(queryTerm), courseName, courseCode).then(
          (data) => {
            data.color = `rgba(
                                ${Math.floor(Math.random() * 256)},
                                ${Math.floor(Math.random() * 256)},
                                ${Math.floor(Math.random() * 256)},0.9)`;
            addCourseToPlan(data);
            queryPlan.courses.push(data);
          }
        );
      });
      notifications.show({
        title: 'Previewing the plan: "' + queryName + '"',
        message: (
          <div>
            <p>Would you like to save this plan to your list of plans?</p>
            <div className="flex justify-evenly">
              <Button
                onClick={() => {
                  addPlan(queryPlan);
                  crnCodeMap.forEach((crn, code) => {
                    selectSection(code, crn);
                  });
                  notifications.clean();
                }}
              >
                Yes
              </Button>
              <Button
                onClick={() => {
                  notifications.clean();
                }}
              >
                No
              </Button>
            </div>
          </div>
        ),
        autoClose: false, // Keeps the notification open until dismissed
        position: "top-center",
      });
    };
    if (searchParams.get("name")) {
      importPlanFromURL();
    }

    // This clears the URL parameters so that refreshing the page does not re-add the plan:
    window.history.replaceState({}, document.title, "/");
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
