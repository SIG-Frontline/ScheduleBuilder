import { useSearchParams } from "next/navigation";
import { planStore } from "@/lib/client/planStore";
import { getSectionByCrn } from "@/lib/server/actions/getSectionByCrn";

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}

export async function importUrlData() {
  const searchParams = useSearchParams();
  const importPlanFromURL = async () => {
    const queryName = searchParams.get("name") ?? "Imported Plan";
    const queryTerm = searchParams.get("term") ?? "0";
    const newUuid = uuidv4();
    const crnValues: Array<string> = [];
    const crnRegex = /crn\d+/;

    searchParams.forEach((value, key) => {
      if (crnRegex.test(key)) {
        crnValues.push(value);
      }
    });

    const queryPlan = {
      uuid: newUuid,
      name: queryName,
      description: "Plan imported from URL",
      term: parseInt(queryTerm, 10),
      courses: [],
      events: [],
      selected: true,
      crns: crnValues,
    };

    crnValues.forEach((thisCrn) => {
      getSectionByCrn(parseInt(queryTerm), thisCrn).then((data) => {
        data.color = `rgba(
                            ${Math.floor(Math.random() * 256)},
                            ${Math.floor(Math.random() * 256)},
                            ${Math.floor(Math.random() * 256)},0.9)`;
        addCourseToPlan(data);
        selectSection(data, thisCrn);
      });
    });
  };
  importPlanFromURL();
}
