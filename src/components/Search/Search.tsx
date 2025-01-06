import { createRef, useEffect, useMemo, useState } from "react";
import { Chip, Group, Select } from "@mantine/core";
import { getSubjects } from "@/actions/getSubjects";
import { getClasses } from "@/actions/getClasses";
import { getSections } from "@/actions/getSections";
import { useMediaQuery } from "@mantine/hooks";
import { planStore } from "@/lib/planStore";
import { getSectionData } from "@/actions/getSectionData";

export default function Search({
  onFocused,
  onBlurred,
}: {
  onFocused: () => void;
  onBlurred: () => void;
}) {
  const [textBoxValue, setTextBoxValue] = useState<string>("");
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const searchWithoutSubject = useMemo(() => {
    return textBoxValue.replace(selectedSubject, "").trim();
  }, [textBoxValue, selectedSubject]);
  const matches = useMediaQuery(
    "only screen and (orientation: landscape) and (min-width: 1201px)"
  );
  const chipGroupRef = createRef<HTMLDivElement>();
  useEffect(() => {
    getSubjects(202490).then((courses) => {
      //server side fn to get subjects
      setSubjectOptions(courses);
    });
  }, []); //on mount - no dependencies

  const filteredSubjectOptions = subjectOptions.filter((option) =>
    //filter the subject options based on the search value
    option.includes(textBoxValue)
  );
  const filteredClassOptions = classOptions.filter((option) =>
    //filter the class options based on the search value without the subject
    option.includes(searchWithoutSubject)
  );

  const chipOptions = selectedSubject
    ? filteredClassOptions
    : filteredSubjectOptions;
  useEffect(() => {
    //when the textbox value changes
    setTextBoxValue(textBoxValue.toUpperCase()); //make the input uppercase

    if (subjectOptions.includes(textBoxValue)) {
      //if there is a subject in the textbox like CS, and it is not set as the selected subject
      setSelectedSubject(textBoxValue);
      getClasses(202490, textBoxValue).then((classes) => {
        //server side fn to get classes for the subject - only called when a subject is selected
        setClassOptions(classes);
        console.log("classes", classes);
      });
    } else if (selectedSubject && textBoxValue.includes(selectedSubject)) {
      //if the textbox value includes the already selected subject

      //if there is only one class option, set the textbox value to the subject and class
      if (filteredClassOptions.length === 1) {
        //get the sections
        getSections(202490, selectedSubject, chipOptions[0]).then(
          (sections) => {
            console.log("sections", sections);
            setSectionOptions(sections);
          }
        );
      }
    } else {
      setSelectedSubject(""); //reset the selected subject if the textbox value does not include it
    }
  }, [textBoxValue, subjectOptions, selectedSubject, searchWithoutSubject]);
  const addCourseToPlan = planStore((state) => state.addCourseToPlan);
  return (
    <>
      {/* {selectedSubject && sectionOptions.length > 0 ? ( */}
      <Select
        className={"max-w-screen" + (!matches ? " w-screen" : "")}
        onFocus={onFocused}
        onBlur={(event) => {
          //keep the state of the dropdown search value
          setTextBoxValue(event.currentTarget.value);
          onBlurred();
        }}
        label=""
        // maxDropdownHeight={200}
        // withScrollArea={true}
        placeholder="Pick value"
        data={sectionOptions}
        comboboxProps={{ position: matches ? "top" : "bottom" }}
        dropdownOpened={filteredClassOptions.length === 1 && !!selectedSubject}
        // dropdownOpened={true}
        searchable
        searchValue={textBoxValue}
        onSearchChange={(value) => {
          setTextBoxValue(value);
        }}
        onOptionSubmit={async (value) => {
          await getSectionData(202490, selectedSubject, chipOptions[0]).then(
            (data) => {
              console.log("data", data); //need to add the data to the plan in the store (todo !!!)
            }
          );
          setTimeout(() => {
            setTextBoxValue("");
            setSelectedSubject("");
          }, 10);
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
      {/* ) : (
        <TextInput
          placeholder="Pick value"
          value={textBoxValue}
          onChange={(event) => setTextBoxValue(event.currentTarget.value)}
        />
      )} */}
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
    </>
  );
}
