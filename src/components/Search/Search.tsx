import { useEffect, useMemo, useState } from "react";
import { Chip, TextInput, Group } from "@mantine/core";
import { getSubjects } from "@/actions/getSubjects";
import { getClasses } from "@/actions/getClasses";

export default function Search() {
  const [textBoxValue, setTextBoxValue] = useState<string>("");
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const searchWithoutSubject = useMemo(() => {
    return textBoxValue.replace(selectedSubject, "").trim();
  }, [textBoxValue, selectedSubject]);

  useEffect(() => {
    getSubjects(202490).then((res) => {
      //server side fn to get subjects
      const courses = res.map((course: { SUBJECT: string }) => course.SUBJECT);
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
      getClasses(202490, textBoxValue).then((res) => {
        //server side fn to get classes for the subject - only called when a subject is selected
        const classes = res.map(
          (course: { COURSE_NUMB: string }) => course.COURSE_NUMB
        );
        setClassOptions(classes);
        console.log("classes", classes);
      });
    } else if (selectedSubject && textBoxValue.includes(selectedSubject)) {
      //if the textbox value includes the already selected subject
      //do nothing
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
      />
      <Chip.Group
        multiple={false}
        onChange={(val) => {
          setTextBoxValue(textBoxValue + val);
        }}
      >
        <Group className="flex flex-row !flex-nowrap py-2">
          {selectedSubject}
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
    </>
  );
}
