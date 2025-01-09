import Icon from "@/components/Icon/Icon";
import { planStore, Section } from "@/lib/planStore";
import {
  ActionIcon,
  Combobox,
  Group,
  Input,
  InputBase,
  useCombobox,
} from "@mantine/core";
import React, { useState } from "react";

const SectionSelection = ({
  courseCode,
  sections,
  courseTitle,
}: {
  courseCode: string;
  sections: Section[];
  courseTitle: string;
}) => {
  const selectSection = planStore((state) => state.selectSection);
  const deleteCourseFromPlan = planStore((state) => state.deleteCourseFromPlan);
  const combobox = useCombobox();
  const [value, setValue] = useState<string | null>(
    sections.find((item) => item.selected)?.crn || null
  );
  const options = sections.map((item) => (
    <Combobox.Option value={item.crn} key={item.crn}>
      {courseCode + " -" + item.instructor}
    </Combobox.Option>
  ));
  return (
    <>
      <h1>
        {courseCode} {courseTitle}
      </h1>
      <Group>
        <div className="flex-grow">
          <Combobox
            store={combobox}
            onOptionSubmit={(val) => {
              setValue(val);
              combobox.closeDropdown();
              selectSection(courseCode, val);
            }}
          >
            <Combobox.Target>
              <InputBase
                component="button"
                type="button"
                pointer
                rightSection={<Combobox.Chevron />}
                rightSectionPointerEvents="none"
                onClick={() => combobox.toggleDropdown()}
              >
                {value || <Input.Placeholder>Pick value</Input.Placeholder>}
              </InputBase>
            </Combobox.Target>
            <Combobox.Dropdown
              onWheel={(event) => {
                //prevent scrolling on the page when scrolling on the dropdown
                event.preventDefault();
                event.stopPropagation();
                event.nativeEvent.stopImmediatePropagation();
              }}
            >
              <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
                {options}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </div>

        <ActionIcon
          className="m-2"
          variant="outline"
          aria-label="remove"
          color="red"
          onClick={() => deleteCourseFromPlan(courseCode)}
        >
          <Icon>delete</Icon>
        </ActionIcon>
      </Group>
    </>
  );
};

export default SectionSelection;
