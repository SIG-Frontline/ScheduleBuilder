import { useSearchParams } from "next/navigation";
import { planStore } from "@/lib/client/planStore";
import { getSectionByCrn } from "@/lib/server/actions/getSectionByCrn";

const addPlan = planStore().addPlan;
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

export async function importUrlData() {
  const searchParams = useSearchParams();
  const urlParams = new URLSearchParams(window.location.search);

  const planFromURL = async () => {
    const linkedName = searchParams.get("name") ?? "Default Plan Name";
    const linkedTerm = searchParams.get("term") ?? "0";
    const freshUuid = uuidv4();
    const crnValues: Array<string> = [];
    const crnRegex = /crn\d+/;

    urlParams.forEach((value, key) => {
      if (crnRegex.test(key)) {
        crnValues.push(value);
      }
    });

    const linkedPlan = {
      uuid: freshUuid,
      name: linkedName,
      description: "Plan imported from link",
      term: parseInt(linkedTerm, 10),
      courses: [],
      events: [],
      selected: true,
    };

    addPlan(linkedPlan);

    crnValues.forEach((thisCrn) => {
      getSectionByCrn(parseInt(linkedTerm), thisCrn).then((data) => {
        data.color = `rgba(
                        ${Math.floor(Math.random() * 256)},
                        ${Math.floor(Math.random() * 256)},
                        ${Math.floor(Math.random() * 256)},0.9)`;
        addCourseToPlan(data);
        selectSection(data, thisCrn);
      });
    });
  };
  planFromURL();
}
