import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea, TextInput, UnstyledButton } from "@mantine/core";
import { getSubjects } from "@/lib/server/actions/getSubjects";
import { getClasses } from "@/lib/server/actions/getClasses";
import { getSectionData } from "@/lib/server/actions/getSectionData";
import { planStore } from "@/lib/client/planStore";
import { useClickOutside, useThrottledValue } from "@mantine/hooks";
import { subjectStore } from "@/lib/client/subjectStore";
import { filterStore } from "@/lib/client/filterStore";
// the below subjects are stored in the database as just one subject and no code - so when the subject is selected, just add the course to the plan
const specialSubjects = [
  "FYSSEM",
  "CENEXT",
  "FRSHSEM",
  "HUMELEC",
  "MRBMED",
  "MREXCH",
  "MRFRSH",
  "MRFTF",
  "MRGLBL",
  "MRGRAD",
  "MRINTL",
  "MRMIL",
  "MRRBHS",
  "MRREG",
  "MRRUTG",
  "MRUMD",
];

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
  const [classOptions, setClassOptions] = useState<
    { id: string; title: string }[]
  >([]);
  const subjectOptions = subject_store.subjects;
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const searchWithoutSubject = useMemo(() => {
    return textBoxValue.replace(selectedSubject, "").trim();
  }, [textBoxValue, selectedSubject]);
  const plan_store = planStore();
  const selectedPlanuuid = plan_store.currentSelectedPlan;
  const selectedPlan = plan_store.plans.find(
    (plan) => plan.uuid === selectedPlanuuid
  );
  // state to track if enter has been pressed once, resulting in auto completed class title
  const [autoCompletedText, setAutoCompletedText] = useState(false);
  const [textHovered, setTextHovered] = useState(-1);
  const scrollAreaRef = createRef<HTMLDivElement>();

  useEffect(() => {
    //if the term changes, get the subjects again
    if (
      (selectedPlan?.term && selectedPlan?.term !== subject_store.term) || // if the term is not set or the term is not the same as the term in the store
      !subjectOptions.length
    ) {
      getSubjects(selectedPlan?.term ?? 202490).then((courses) => {
        // setSubjectOptions(courses);
        subject_store.setSubjects(courses, selectedPlan?.term ?? 0);
      });
    }
  }, [selectedPlan?.term, subjectOptions.length, subject_store]); //on mount - no dependencies

  //filter the subject options based on the search value
  const filteredSubjectOptions = subjectOptions.filter((option) =>
    option.includes(textBoxValue)
  );
  //filter the class options based on the search value without the subject
  const filteredClassOptions = classOptions.filter((option) => {
    const idTitle = option.id + ": " + option.title;
    if (option.id && option.title) {
      return (
        option.id.includes(searchWithoutSubject) ||
        option.title.includes(searchWithoutSubject) ||
        idTitle.includes(searchWithoutSubject)
      );
    }
  });
  const addCourseToPlan = planStore((state) => state.addCourseToPlan);
  const searchOptions = selectedSubject
    ? filteredClassOptions
    : filteredSubjectOptions;
  const filter_store = filterStore();
  const throttledfilter_storeValue = useThrottledValue(
    filter_store.filters,
    1000
  );
  useEffect(() => {
    //when the textbox value changes
    setTextBoxValue(textBoxValue.toUpperCase()); //make the input uppercase

    if (subjectOptions.includes(textBoxValue)) {
      setSelectedSubject(textBoxValue);
      getClasses(
        selectedPlan?.term ?? 202490,
        textBoxValue,
        "",
        throttledfilter_storeValue
      ).then((classes) => {
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
    throttledfilter_storeValue,
  ]);

  const handleClassSelection = (searchResult: string) => {
    //if the option is a class, and there is a subject selected, and the subject is in the textbox
    if (
      (selectedSubject && textBoxValue.startsWith(selectedSubject)) ||
      specialSubjects.includes(searchResult)
    ) {
      getSectionData(
        selectedPlan?.term ?? 202490,
        selectedSubject,
        searchResult
      )
        .then((data) => {
          data.color = `rgba(
          ${Math.floor(Math.random() * 256)},
          ${Math.floor(Math.random() * 256)},
          ${Math.floor(Math.random() * 256)},0.9)`;
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
  };

  return (
    <div ref={ref}>
      <TextInput
        ref={textBoxRef}
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
          setTextHovered(-1);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            const firstOption = searchOptions[0];
            const hoveredOption = searchOptions[textHovered] ?? firstOption;
            // Pressing Enter once will autocomplete to the hovered option in search results
            if (!autoCompletedText) {
              setAutoCompletedText(true);
              setTextHovered(-1);
              if (hoveredOption && textBoxValue.length > 0) {
                if (selectedSubject) {
                  setTextBoxValue(selectedSubject);
                  if (typeof hoveredOption === "object") {
                    setTextBoxValue(
                      selectedSubject +
                        " " +
                        hoveredOption.id +
                        ": " +
                        hoveredOption.title
                    );
                  }
                } else {
                  if (typeof hoveredOption === "string") {
                    setTextBoxValue(hoveredOption);
                  }
                }
              }
            } else {
              // Pressing Enter a second time will add the first option in search results to your plan
              setAutoCompletedText(false);
              const hoveredOption = searchOptions[textHovered] ?? firstOption;
              if (typeof hoveredOption === "object") {
                handleClassSelection(hoveredOption.id);
              } else {
                handleClassSelection(hoveredOption);
              }
            }
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setTextHovered((current) => {
              const nextIndex =
                current + 1 >= searchOptions.length ? current : current + 1;
              scrollAreaRef.current
                ?.querySelectorAll("[data-list-item")
                ?.[nextIndex]?.scrollIntoView({ block: "nearest" });
              return nextIndex;
            });
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setTextHovered((current) => {
              const nextIndex = current - 1 < 0 ? current : current - 1;
              scrollAreaRef.current
                ?.querySelectorAll("[data-list-item")
                ?.[nextIndex]?.scrollIntoView({ block: "nearest" });
              return nextIndex;
            });
          }
        }}
      />
      {(textBoxValue.length > 0 ||
        (selectedSubject && filteredClassOptions.length === 1)) && (
        <ScrollArea h={200} type="hover" ref={scrollAreaRef}>
          {searchOptions.map((option, index) => {
            if (typeof option === "object") {
              return (
                <UnstyledButton
                  data-list-item
                  key={option.id}
                  value={option.id}
                  onClick={() => {
                    if (option.id) {
                      handleClassSelection(option.id);
                    } else {
                      handleClassSelection(option.title);
                    }
                  }}
                  w={"100%"}
                  px={12}
                  py={6}
                  bg={
                    index === textHovered
                      ? "var(--mantine-color-blue-light)"
                      : undefined
                  }
                >
                  {selectedSubject} {option.id}: {option.title}
                </UnstyledButton>
              );
            } else {
              return (
                <UnstyledButton
                  data-list-item
                  key={option}
                  value={option}
                  onClick={() => handleClassSelection(option)}
                  w={"100%"}
                  px={12}
                  py={6}
                  bg={
                    index === textHovered
                      ? "var(--mantine-color-blue-light)"
                      : undefined
                  }
                >
                  {option}
                </UnstyledButton>
              );
            }
          })}
        </ScrollArea>
      )}
    </div>
  );
}