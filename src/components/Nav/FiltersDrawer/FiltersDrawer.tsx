import Icon from "@/components/Icon/Icon";
import { ActionIcon, Drawer } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

function FiltersDrawer() {
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
      </Drawer>
    </>
  );
}
export default FiltersDrawer;
