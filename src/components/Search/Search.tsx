import { useState } from "react";
import { Combobox, TextInput } from "@mantine/core";
import { Chip, Group } from "@mantine/core";

const options = [
  "ACCT",
  "AD",
  "ARCH",
  "AS",
  "BDS",
  "BIOC",
  "BIOL",
  "BME",
  "BMET",
  "BNFO",
  "CE",
  "CET",
  "CHE",
  "CHEM",
  "CIM",
  "CMT",
  "COM",
  "CS",
  "DD",
  "DS",
  "ECE",
  "ECET",
  "ECON",
  "EM",
  "ENE",
  "ENGL",
  "ENGR",
  "ENTR",
  "EPS",
  "ESC",
  "ET",
  "EVSC",
  "FED",
  "FIN",
  "FRSC",
  "FYS",
  "GSND",
  "HIST",
  "HRM",
  "HSS",
  "ID",
  "IE",
  "INT",
  "INTD",
  "IS",
  "IT",
  "LIT",
  "MARC",
  "MATH",
  "ME",
  "MECH",
  "MET",
  "MGMT",
  "MIS",
  "MIT",
  "MNE",
  "MNET",
  "MR",
  "MRKT",
  "MTEN",
  "MTSE",
  "NEUR",
  "OM",
  "OPSE",
  "PE",
  "PHB",
  "PHEN",
  "PHIL",
  "PHPY",
  "PHYS",
  "PSY",
  "R010",
  "R014",
  "R050",
  "R070",
  "R074",
  "R080",
  "R082",
  "R083",
  "R085",
  "R086",
  "R087",
  "R089",
  "R120",
  "R160",
  "R198",
  "R200",
  "R202",
  "R216",
  "R220",
  "R300",
  "R350",
  "R352",
  "R355",
  "R375",
  "R390",
  "R420",
  "R460",
  "R510",
  "R512",
  "R553",
  "R595",
  "R600",
  "R620",
  "R640",
  "R711",
  "R730",
  "R750",
  "R755",
  "R790",
  "R812",
  "R830",
  "R834",
  "R908",
  "R910",
  "R920",
  "R940",
  "R970",
  "R977",
  "RBHS",
  "SDET",
  "SET",
  "STS",
  "THTR",
  "TRAN",
  "TUTR",
  "UMD",
  "USYS",
  "YWCC",
];
export default function Search() {
  const [value, setValue] = useState<string>("");

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
