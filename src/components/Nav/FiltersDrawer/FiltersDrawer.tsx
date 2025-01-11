import Icon from "@/components/Icon/Icon";
import { ActionIcon, Drawer, SegmentedControl } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Checkbox, Group, Text } from "@mantine/core";
import { filterStore } from "@/lib/filterStore";
function FiltersDrawer() {
  const filter_store = filterStore();
  const [filtersOpened, { open, close }] = useDisclosure(false);
  const matches = useMediaQuery(
    "only screen and (orientation: landscape) and (min-width: 1201px)" //same as in Shell.tsx
  );
  return (
    <>
      <ActionIcon
        aria-label="filter"
        title="filter"
        variant="subtle"
        className="!absolute right-0 top-0 z-20 m-1"
        onClick={open}
      >
        <Icon>filter_list</Icon>
      </ActionIcon>
      <Drawer
        opened={filtersOpened}
        onClose={close}
        title="Filters"
        position={matches ? "right" : "bottom"}
      >
        {/* Drawer content */}
        {/* 
        
        filter for the following:
        honors only
        modality
        graduate only
        undergraduate only
        credit count
          day of the week
        */}
        <Checkbox.Card
          p={"sm"}
          radius="md"
          checked={filter_store.filters.honors}
          onChange={(checked) =>
            filter_store.setFilters({
              ...filter_store.filters,
              honors: checked,
            })
          }
        >
          <Group wrap="nowrap" align="flex-start">
            <Checkbox.Indicator />
            <div>
              <Text fw={500}>Honors only</Text>
              <Text size="xs" c="dimmed">
                Include only honors courses
              </Text>
            </div>
          </Group>
        </Checkbox.Card>
        <SegmentedControl
          data={[
            {
              label: "All Options",
              value: "all",
            },
            {
              label: "Graduate Only",
              value: "graduate",
            },
            {
              label: "Undergraduate Only",
              value: "undergraduate",
            },
          ]}
          value={(() => {
            if (filter_store.filters.graduate) {
              return "graduate";
            } else if (filter_store.filters.undergraduate) {
              return "undergraduate";
            } else {
              return "all";
            }
          })()}
          onChange={(value) => {
            if (value === "graduate") {
              filter_store.setFilters({
                ...filter_store.filters,
                graduate: true,
                undergraduate: false,
              });
            } else if (value === "undergraduate") {
              filter_store.setFilters({
                ...filter_store.filters,
                graduate: false,
                undergraduate: true,
              });
            } else {
              filter_store.setFilters({
                ...filter_store.filters,
                graduate: false,
                undergraduate: false,
              });
            }
          }}
        ></SegmentedControl>
        <Text size="sm" c={"dimmed"}>
          * Architecture 500 courses may be grouped with graduate courses -
          please confirm with your advisor that the course is appropriate for
          your program.
        </Text>
      </Drawer>
    </>
  );
}
export default FiltersDrawer;
