"use client";

import { AppShell, Button } from "@mantine/core";
import Nav from "@/components/Nav/Nav";
import Header from "../Header/Header";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect } from "react";
import { uuidv4 } from "@/lib/uuidv4";
import { useSearchParams } from "next/navigation";
import { planStore } from "@/lib/client/planStore";
import { getSectionDataByCrn } from "@/lib/server/actions/getSectionDataByCrn";
import { notifications } from "@mantine/notifications";
import classes from './Shell.module.css';

export default function Shell({ children }: { children: React.ReactNode }) {
  const addPlan = planStore().addPlan;
  // const addTempPlan = planStore().addTempPlan;
  const addCourseToPlan = planStore((state) => state.addCourseToPlan);
  const searchParams = useSearchParams();

  useEffect(() => {
    // const searchParams = new URLSearchParams(window.location.search);
    const importPlanFromURL = async () => {
      const queryName = searchParams.get("name") ?? "Imported Plan";
      const queryTerm = searchParams.get("term") ?? "0";
      const newUuid = uuidv4();
      // TODO: Since this map is converted to an array whenever it is used, it shouldn't be a map to begin with. Rather a 2D array.
      const crnValues = new Map();
      const crnRegex = /crn\d+/;

      console.log("Search Params:");
      console.log(window.location.search);

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

      console.log(queryPlan);
      addPlan(queryPlan);

      const crnCodeMap = new Map();
      getSectionDataByCrn(window.location.search).then((data) => {
        data.forEach((course) => {
          course.color = `rgba(
                                  ${Math.floor(Math.random() * 256)},
                                  ${Math.floor(Math.random() * 256)},
                                  ${Math.floor(Math.random() * 256)},0.9)`;
          addCourseToPlan(course);
          queryPlan.courses.push(course);
        });
      });
      notifications.show({
        title: 'Previewing: "' + queryName + '"',
        color: "red",
        classNames: classes,
        message: (
          <div>
            <p>Any changes will not be saved unless you add it to your list of plans.</p>
            <div className="flex justify-evenly">
              <Button
                color="gray"
                onClick={() => {
                  queryPlan.isTemporary = false;
                  planStore.getState().updatePlan(queryPlan, queryPlan.uuid);
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
