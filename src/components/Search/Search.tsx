import { useEffect, useState } from "react";
import { Combobox, TextInput } from "@mantine/core";
import { Chip, Group } from "@mantine/core";
import { getSubjects } from "@/actions/getSubjects";
import { getClasses } from "@/actions/getClasses";

export default function Search() {
  const [value, setValue] = useState<string>("");
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  useEffect(() => {
    getSubjects(202490).then((res) => {
      const courses = res.map((course: { SUBJECT: string }) => course.SUBJECT);
      setSubjectOptions(courses);
    });
  }, []);
  //remove the selected value from the list of options
  const filteredSubjectOptions = !selectedSubject
    ? subjectOptions.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      )
    : [];
  const filterSearhString = value.replace(selectedSubject, "").trim();
  const filteredClassOptions = classOptions.filter((option) =>
    option.toLowerCase().includes(filterSearhString.toLowerCase())
  );

  const handleChipClick = (event: React.MouseEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === value) {
      setValue("");
      if (subjectOptions.includes(value)) {
        setSelectedSubject("");
      }
    }
  };
  useEffect(() => {
    //make the value uppercase
    setValue(value.toUpperCase());
  }, [value]);

  /*
        getClasses(202490, value).then((res) => {
        const nums = res.map(
          (course: { COURSE_NUMB: string }) => course.COURSE_NUMB
        );
        console.log(nums);
        
        setClassOptions(nums);
      });
  */
  //do the above when the value is selected
  useEffect(() => {
    if (value !== "" && subjectOptions.includes(value)) {
      setSelectedSubject(value);
      getClasses(202490, value).then((res) => {
        const nums = res.map(
          (course: { COURSE_NUMB: string }) => course.COURSE_NUMB
        );
        console.log(nums);

        setClassOptions(nums);
      });
    }
  }, [value]);

  return (
    <Combobox>
      <Combobox.EventsTarget>
        <TextInput
          placeholder="Pick value"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
      </Combobox.EventsTarget>
      <Chip.Group multiple={false} value={value} onChange={setValue}>
        <Group>
          <Combobox.Options display={"flex"} className="flex-row">
            {selectedSubject && (
              <Combobox.Option key={selectedSubject} value={selectedSubject}>
                <Chip
                  className="flex items-center justify-center"
                  onClick={handleChipClick}
                  value={selectedSubject}
                  checked={true}
                >
                  {selectedSubject}
                </Chip>
              </Combobox.Option>
            )}

            {[...filteredSubjectOptions, ...filteredClassOptions].map(
              (option) => (
                <Combobox.Option key={option} value={option}>
                  <Chip
                    className="flex items-center justify-center"
                    onClick={handleChipClick}
                    value={option}
                    checked={filteredClassOptions.length === 1}
                  >
                    {option}
                  </Chip>
                </Combobox.Option>
              )
            )}
          </Combobox.Options>
        </Group>
      </Chip.Group>
    </Combobox>
  );
}
