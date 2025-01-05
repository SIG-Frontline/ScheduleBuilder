import { createRef, useEffect, useMemo, useState } from "react";
import { Chip, TextInput, Group } from "@mantine/core";
import { getSubjects } from "@/actions/getSubjects";
import { getClasses } from "@/actions/getClasses";
import { getSections } from "@/actions/getSections";

export default function Search() {
  const [textBoxValue, setTextBoxValue] = useState<string>("");
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const searchWithoutSubject = useMemo(() => {
    return textBoxValue.replace(selectedSubject, "").trim();
  }, [textBoxValue, selectedSubject]);

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
        getSections(202490, selectedSubject, filteredClassOptions[0]).then(
          (sections) => {
            console.log("sections", sections);
          }
        );
      }
    } else {
      setSelectedSubject(""); //reset the selected subject if the textbox value does not include it
    }
  }, [textBoxValue, subjectOptions, selectedSubject, searchWithoutSubject]);
  return (
    <>
      <TextInput
        placeholder="Pick value"
        value={textBoxValue}
        onChange={(event) => setTextBoxValue(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            const firstOption = chipOptions[0];
            if (firstOption) {
              setTextBoxValue(textBoxValue + firstOption);
            }
          }
        }}
      />
      <Chip.Group
        onChange={(val) => {
          setTextBoxValue(textBoxValue + val);
        }}
        value={[]} //no value selected for visible chips
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
          {textBoxValue.length > 0
            ? chipOptions.map((option) => (
                <Chip
                  key={option}
                  className="flex items-center justify-center"
                  value={option}
                >
                  {option}
                </Chip>
              ))
            : null}
        </Group>
      </Chip.Group>
    </>
  );
}
