import { use, useEffect, useState } from "react";
import { Combobox, TextInput } from "@mantine/core";
import { Chip, Group } from "@mantine/core";
import { getSubjects } from "@/actions/getSubjects";

export default function Search() {
  const [value, setValue] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  useEffect(() => {
    getSubjects(202490).then((res) => {
      let courses = res.map((course) => course.SUBJECT);
      setOptions(courses);
      console.log(courses);
    });
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase())
  );
  const handleChipClick = (event: React.MouseEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === value) {
      setValue("");
    }
  };
  return (
    <Combobox onOptionSubmit={setValue}>
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
            {filteredOptions.map((option) => (
              <Combobox.Option key={option} value={option}>
                <Chip onClick={handleChipClick} value={option}>
                  {option}
                </Chip>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Group>
      </Chip.Group>
    </Combobox>
  );
}
