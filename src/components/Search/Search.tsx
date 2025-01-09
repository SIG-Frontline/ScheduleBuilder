import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { Chip, Group, TextInput } from "@mantine/core";
import { getSubjects } from "@/actions/getSubjects";
import { getClasses } from "@/actions/getClasses";
import { getSectionData } from "@/actions/getSectionData";
import { planStore } from "@/lib/planStore";
import { useClickOutside } from "@mantine/hooks";
import { subjectStore } from "@/lib/subjectStore";

export default function Search({
  onFocused,
  onBlurred,
}: {
  onFocused: () => void;
  onBlurred: () => void;
}) {
  const ref = useClickOutside(() => {
    onBlurred();
  });
  const subject_store = subjectStore();
  const [textBoxValue, setTextBoxValue] = useState<string>("");
  const textBoxRef = useRef<HTMLInputElement>(null);
  // const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const subjectOptions = subject_store.subjects;
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const searchWithoutSubject = useMemo(() => {
    return textBoxValue.replace(selectedSubject, "").trim();
  }, [textBoxValue, selectedSubject]);
  const plan_store = planStore();
  const selectedPlanuuid = plan_store.currentSelectedPlan;
  const selectedPlan = plan_store.plans.find(
    (plan) => plan.uuid === selectedPlanuuid
  );

  const chipGroupRef = createRef<HTMLDivElement>();
  useEffect(() => {
    //if the term changes, get the subjects again
    if (
      (selectedPlan?.term && selectedPlan?.term !== subject_store.term) || // if the term is not set or the term is not the same as the term in the store
      !subjectOptions.length
    ) {
      getSubjects(selectedPlan?.term ?? 202490).then((courses) => {
        // setSubjectOptions(courses);
        subject_store.setSubjects(courses, selectedPlan?.term);
      });
    }
  }, [selectedPlan?.term, subjectOptions.length, subject_store]); //on mount - no dependencies

  const filteredSubjectOptions = subjectOptions.filter((option) =>
    //filter the subject options based on the search value
    option.includes(textBoxValue)
  );
  const filteredClassOptions = classOptions.filter((option) =>
    //filter the class options based on the search value without the subject
    option.includes(searchWithoutSubject)
  );
  const addCourseToPlan = planStore((state) => state.addCourseToPlan);
  const chipOptions = selectedSubject
    ? filteredClassOptions
    : filteredSubjectOptions;
  useEffect(() => {
    //when the textbox value changes
    setTextBoxValue(textBoxValue.toUpperCase()); //make the input uppercase

    if (subjectOptions.includes(textBoxValue)) {
      //if there is a subject in the textbox like CS, and it is not set as the selected subject
      setSelectedSubject(textBoxValue);
      getClasses(selectedPlan?.term ?? 202490, textBoxValue).then((classes) => {
        //server side fn to get classes for the subject - only called when a subject is selected
        setClassOptions(classes);
        console.log("classes", classes);
      });
    }
    //make it so that the selected subject is not reset if the textbox value includes the selected subject and the user is typing
    else if (textBoxValue.startsWith(selectedSubject)) {
      //if the selected subject is not in the textbox
    } else {
      setSelectedSubject(""); //reset the selected subject if the textbox value does not include it
    }
  }, [
    textBoxValue,
    subjectOptions,
    selectedSubject,
    searchWithoutSubject,
    selectedPlan?.term,
  ]);
  return (
    <div ref={ref}>
      {/* {selectedSubject && sectionOptions.length > 0 ? ( */}
      <TextInput
        ref={textBoxRef}
        // className={"max-w-screen" + (!matches ? " w-screen" : "")}
        onFocus={(e) => {
          onFocused();
          //scroll to the elm immediately on focus
          e.currentTarget.scrollIntoView({ behavior: "smooth" });
        }}
        onBlur={() => {
          if (textBoxValue.length === 0) {
            onBlurred();
          }
        }}
        label=""
        placeholder="Search for a course"
        value={textBoxValue}
        onChange={(e) => {
          setTextBoxValue(e.currentTarget.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            const firstOption = chipOptions[0];
            if (firstOption && textBoxValue.length > 0) {
              if (selectedSubject) {
                setTextBoxValue(selectedSubject + firstOption);
              } else {
                setTextBoxValue(firstOption);
              }
            }
          }
        }}
      />
      {(textBoxValue.length > 0 ||
        (selectedSubject && filteredClassOptions.length === 1)) && (
        <Chip.Group
          multiple={false}
          onChange={(chipValue) => {
            if (textBoxValue.startsWith(chipValue)) {
              setTextBoxValue(chipValue);
            } else {
              setTextBoxValue(selectedSubject + chipValue);
            }
            //if the chip is a class, and there is a subject selected, and the subject is in the textbox
            if (selectedSubject && textBoxValue.startsWith(selectedSubject)) {
              getSectionData(
                selectedPlan?.term ?? 202490,
                selectedSubject,
                chipValue
              )
                .then((data) => {
                  addCourseToPlan(data);
                })
                .then(() => {
                  setTextBoxValue("");
                });
            }
            //focus the textbox after selecting a chip
            setTimeout(() => {
              textBoxRef.current?.focus();
            }, 10);
          }}
          value={null} //no value selected for visible chips
        >
          <Group
            className="flex flex-row !flex-nowrap py-2 overflow-x-auto no-scrollbar"
            ref={chipGroupRef}
            onWheel={(e) => {
              // comment out to preserve default scrolling:
              // e.preventDefault();
              if (e.deltaY > 0 && chipGroupRef.current) {
                chipGroupRef.current.scrollLeft += 100;
              } else if (e.deltaY < 0 && chipGroupRef.current) {
                chipGroupRef.current.scrollLeft -= 100;
              }
            }}
          >
            {chipOptions.map((option) => (
              <Chip
                key={option}
                className="flex items-center justify-center"
                value={option}
              >
                {option}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      )}
    </div>
  );
}
