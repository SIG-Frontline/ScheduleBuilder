import { useState } from "react";
import { Combobox, TextInput } from "@mantine/core";
import { Chip } from "@mantine/core";

const options = ["First", "Second", "Third", "Fourth", "Fifth"];
export default function Search() {
  const [value, setValue] = useState("Second");
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
        <Combobox.Options mt="sm" display={"inline-flex"}>
          {options.map((option) => (
            <Combobox.Option key={option} value={option}>
              <Chip value={option}>{option}</Chip>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Chip.Group>
    </Combobox>
  );
}
