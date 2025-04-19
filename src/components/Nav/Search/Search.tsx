import { createRef, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollArea,
  TextInput,
  UnstyledButton,
  Highlight,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getSubjects } from "@/lib/server/actions/getSubjects";
import { getClasses } from "@/lib/server/actions/getClasses";
import { getSectionData } from "@/lib/server/actions/getSectionData";
import { planStore } from "@/lib/client/planStore";
import {
  useClickOutside,
  useThrottledValue,
  useDebouncedValue,
} from "@mantine/hooks";
import { subjectStore } from "@/lib/client/subjectStore";
import { filterStore } from "@/lib/client/filterStore";
// the below subjects are stored in the database as just one subject and no code - so when the subject is selected, just add the course to the plan
const specialSubjects = [
  "FYSSEM",
  "CENEXT",
  "FRSHSEM",
  "HUMELEC",
  "MRBMED",
  "MREXCH",
  "MRFRSH",
  "MRFTF",
  "MRGLBL",
  "MRGRAD",
  "MRINTL",
  "MRMIL",
  "MRRBHS",
  "MRREG",
  "MRRUTG",
  "MRUMD",
];

export default function Search({
  onFocused,
  onBlurred,
}: {
  onFocused: () => void;
  onBlurred: () => void;
}) {
  const ref = useClickOutside(() => {
    onBlurred();
  });
  const subject_store = subjectStore();
  const [textBoxValue, setTextBoxValue] = useState<string>("");
  // this debounced text box is used to add a delay to API calls
  // if a user is typing it will prevent API calls until 500ms after the value is set
  const [debouncedTextBoxValue] = useDebouncedValue(textBoxValue, 500);
  const textBoxRef = useRef<HTMLInputElement>(null);
  const [classOptions, setClassOptions] = useState<
    { id: string; title: string; subject: string }[] | string[]
  >([]);
  const [searchByTitle, setSearchByTitle] = useState(false);
  const subjectOptions = subject_store.subjects;
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [searchBarDisabled, setSearchBarDisabled] = useState(false);
  const searchWithoutSubject = useMemo(() => {
    if (specialSubjects.includes(selectedSubject)) {
      return textBoxValue.trim();
    } else {
      return textBoxValue.replace(selectedSubject, "").trim();
    }
  }, [textBoxValue, selectedSubject]);
  const plan_store = planStore();
  const selectedPlanuuid = plan_store.currentSelectedPlan;
  const selectedPlan = plan_store.plans.find(
    (plan) => plan.uuid === selectedPlanuuid
  );
  // state to track if enter has been pressed once, resulting in auto completed class title
  const [autoCompletedText, setAutoCompletedText] = useState(false);
  const [textHovered, setTextHovered] = useState(-1);
  const scrollAreaRef = createRef<HTMLDivElement>();

  useEffect(() => {
    //if the term changes, get the subjects again
    if (
      (selectedPlan?.term && selectedPlan?.term !== subject_store.term) || // if the term is not set or the term is not the same as the term in the store
      !subjectOptions.length
    ) {
      getSubjects(selectedPlan?.term ?? 202490).then((courses) => {
        subject_store.setSubjects(courses, selectedPlan?.term ?? 0);
      });
    }
    // if there is no selected plan, disable search bar and display a toast
  }, [selectedPlan?.term, subjectOptions.length, subject_store]); //on mount - no dependencies

  useEffect(() => {
    if (selectedPlanuuid) {
      setSearchBarDisabled(false);
    }
  }, [selectedPlanuuid])


  //filter the class options based on the search value without the subject
  const filteredClassOptions = classOptions.filter((option) => {
    if (typeof option === "object") {
      const idTitle = option.id + " " + option.title;
      if (option.id && option.title) {
        return (
          option.id.includes(searchWithoutSubject) ||
          option.title.includes(searchWithoutSubject) ||
          idTitle.includes(searchWithoutSubject)
        );
      } else if (option.id) {
        return option.id;
      } else if (option.title) {
        return option.title;
      }
    } else {
      return option;
    }
  });
  const addCourseToPlan = planStore((state) => state.addCourseToPlan);
  const searchOptions =
    selectedSubject || searchByTitle ? filteredClassOptions : [];
  const filter_store = filterStore();
  const throttledfilter_storeValue = useThrottledValue(
    filter_store.filters,
    1000
  );
  useEffect(() => {
    // when the textbox value is empty reset the selected subject and class options
    if (!debouncedTextBoxValue.trim()) {
      setSelectedSubject("");
      setClassOptions([]);
      setSearchByTitle(false);
      return;
    }

    const words = debouncedTextBoxValue.split(" ");
    const firstWord = words[0];
    const isSubject =
      subjectOptions.includes(firstWord) ||
      specialSubjects.some((opt) => opt.includes(firstWord));

    if (isSubject) {
      console.log("isSubject");
      setSearchByTitle(false);
      setSelectedSubject(firstWord);
      getClasses(
        selectedPlan?.term ?? 202490,
        firstWord,
        "",
        throttledfilter_storeValue
      ).then((classes) => {
        //server side fn to get classes for the subject - only called when a subject is selected
        setClassOptions(classes);
        console.log("classes", classes);
      });
      //make it so that the selected subject is not reset if the textbox value includes the selected subject and the user is typing
    } else if (isSubject && selectedSubject) {
      setSearchByTitle(false);
      //if the selected subject is not in the textbox
    } else if (!isSubject && debouncedTextBoxValue.trim() !== "") {
      console.log("search by title");
      getClasses(
        selectedPlan?.term ?? 202490,
        "",
        debouncedTextBoxValue,
        throttledfilter_storeValue
      ).then((classes) => {
        setClassOptions(classes);
        setSearchByTitle(true);
        console.log("classes", classes);
      });
    }
    // I disabled eslint because I need to use subject options in the hook,
    // But keeping it as a dependency caused an extra unneccessary api call
    // This does not affect search behavior or cause any stale states, as far as I can tell
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan?.term, throttledfilter_storeValue, debouncedTextBoxValue]);

  // this function adds the course selected, to the course plan and retrieves the section data
  const handleClassSelection = (searchResult: {
    id: string;
    subject: string;
    title: string;
  }) => {
    //if the option is a class, and there is a subject selected, and the subject is in the textbox
    getSectionData(
      selectedPlan?.term ?? 202490,
      searchResult.subject,
      searchResult.id
    )
      .then((data) => {
        const colorArr = [
          "#2e2e2e",
          "#868e96",
          "#fa5252",
          "#e64980",
          "#be4bdb",
          "#7950f2",
          "#4c6ef5",
          "#228be6",
          "#15aabf",
          "#12b886",
          "#40c057",
          "#82c91e",
          "#fab005",
          "#fd7e14",
        ];
        data.color = colorArr[Math.floor(Math.random() * colorArr.length)]; //random color for the course
        addCourseToPlan(data);
      })
      .then(() => {
        setTextBoxValue("");

        // Simulate a click on the navbar element that opens the sections tab
        // This will likely need to be switched when the navbar is changed
        setTimeout(() => {
          const sectionsTab = document.querySelector('button[id*="tab-plans"]');
          if (
            sectionsTab instanceof HTMLElement &&
            sectionsTab.getAttribute("aria-selected") !== "true" //ensures that the sections tab is only clicked if it is not already selected
          ) {
            sectionsTab.click();
          }
        }, 100); // Add a small Delay to ensure state updates before the tab is clicked
      });
    //focus the textbox after selecting a search option
    setTimeout(() => {
      textBoxRef.current?.focus();
    }, 10);
  };

  // this function will highlight the search result characters that match the users query
  const extractMatchingText = (
    searchResultText: string,
    searchInput: string
  ) => {
    if (!searchInput.trim()) return [];

    const searchWords = searchInput
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => word.toLowerCase()); // Split search input into words

    if (searchWords.length === 0) return [];

    const matchedWords: string[] = [];
    const remainingText = searchResultText.toLowerCase();

    for (const word of searchWords) {
      let startIndex = 0;
      while (startIndex < remainingText.length) {
        const matchIndex = remainingText.indexOf(word, startIndex);
        if (matchIndex === -1) break;

        matchedWords.push(
          searchResultText.substring(matchIndex, matchIndex + word.length)
        );

        startIndex = matchIndex + word.length;
      }
    }

    return [...new Set(matchedWords)];
  };

  const handleInputClick = () => {
    if (!selectedPlanuuid) {
      setSearchBarDisabled(true);
      notifications.show({
        title: "Plan Required",
        message: `Please create a plan before using the search bar!`,
        color: "red",
        autoClose: 2000,
        position: "top-right",
      });
    }
  };

  return (
    <div ref={ref} className="flex flex-col-reverse lg:flex-col relative">
      <TextInput
        ref={textBoxRef}
        onFocus={(e) => {
          onFocused();
          //scroll to the elm immediately on focus
          e.currentTarget.scrollIntoView({ behavior: "smooth" });
        }}
        onBlur={() => {
          if (textBoxValue.length === 0) {
            onBlurred();
          }
        }}
        onClick={handleInputClick}
        label=""
        placeholder="Search for a course"
        value={textBoxValue}
        disabled={searchBarDisabled}
        onChange={(e) => {
          // capitalizes textbox value && changes it only if the value has changed
          let newValue = e.currentTarget.value.toUpperCase();
          // Extract subject prefix and number part
          const match = newValue.match(/^([A-Za-z]+)(\d.*)?$/);
          if (match && subjectOptions.includes(match[1])) {
            newValue = match[1] + (match[2] ? ` ${match[2]}` : ""); // Insert space if subject is valid
          }
          if (newValue !== textBoxValue) {
            setTextBoxValue(newValue);
            setTextHovered(-1);
          }
        }}
        radius={"0"}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            const firstOption = searchOptions[0];
            const hoveredOption = searchOptions[textHovered] ?? firstOption;
            // Pressing Enter once will autocomplete to the hovered option in search results
            if (!autoCompletedText) {
              setAutoCompletedText(true);
              setTextHovered(-1);
              if (hoveredOption && textBoxValue.length > 0) {
                // if a course has subject, id, and title
                if (typeof hoveredOption === "object") {
                  if (hoveredOption.id) {
                    setTextBoxValue(
                      hoveredOption.subject +
                        " " +
                        hoveredOption.id +
                        " " +
                        hoveredOption.title
                    );
                  } else {
                    // if a course doesn't have an id, mostly special subject courses
                    setTextBoxValue(
                      hoveredOption.subject + " " + hoveredOption.title
                    );
                  }
                }
              }
            } else {
              // Pressing Enter a second time will add the first option in search results to your plan
              setAutoCompletedText(false);
              const hoveredOption = searchOptions[textHovered] ?? firstOption;
              if (typeof hoveredOption === "object") {
                handleClassSelection(hoveredOption);
              }
            }
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setTextHovered((current) => {
              const nextIndex =
                current + 1 >= searchOptions.length ? current : current + 1;
              scrollAreaRef.current
                ?.querySelectorAll("[data-list-item")
                ?.[nextIndex]?.scrollIntoView({ block: "nearest" });
              return nextIndex;
            });
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setTextHovered((current) => {
              const nextIndex = current - 1 < 0 ? current : current - 1;
              scrollAreaRef.current
                ?.querySelectorAll("[data-list-item")
                ?.[nextIndex]?.scrollIntoView({ block: "nearest" });
              return nextIndex;
            });
          }
        }}
      />

      {(textBoxValue.length > 0 ||
        (searchOptions && filteredClassOptions.length === 1)) && (
        <ScrollArea.Autosize
          mah={200}
          scrollbars="y"
          type="hover"
          ref={scrollAreaRef}
          data-testid="search-results"
        >
          {searchOptions.map((option, index) => {
            if (typeof option === "object") {
              return (
                <UnstyledButton
                  data-list-item
                  data-testid="search-result-item"
                  key={index}
                  value={option.id}
                  onClick={() => {
                    handleClassSelection(option);
                  }}
                  onMouseEnter={() => setTextHovered(index)}
                  onMouseLeave={() => setTextHovered(-1)}
                  w={"100%"}
                  px={12}
                  py={6}
                  bg={
                    index === textHovered
                      ? "var(--mantine-color-blue-light)"
                      : undefined
                  }
                >
                  <Highlight
                    highlight={extractMatchingText(
                      `${option.subject} ${option.id ? option.id + " " : ""}${
                        option.title
                      }`,
                      textBoxValue
                    )}
                    highlightStyles={{
                      fontWeight: 700,
                      backgroundColor: "rgba(255, 255, 255, 0)", // need to set a bg color but opacity 0 removes the bg
                    }}
                  >
                    {option.id
                      ? `${option.subject} ${option.id} ${option.title}`
                      : `${option.subject} ${option.title}`}
                  </Highlight>
                </UnstyledButton>
              );
            } else {
              return (
                <UnstyledButton
                  data-list-item
                  key={index}
                  value={option}
                  onClick={() => {
                    console.log(option);
                  }}
                  onMouseEnter={() => setTextHovered(index)}
                  onMouseLeave={() => setTextHovered(-1)}
                  w={"100%"}
                  px={12}
                  py={6}
                  bg={
                    index === textHovered
                      ? "var(--mantine-color-blue-light)"
                      : undefined
                  }
                >
                  <Highlight
                    highlight={extractMatchingText(option, textBoxValue)}
                    highlightStyles={{
                      fontWeight: 700,
                      backgroundColor: "rgba(255, 255, 255, 0)", // need to set a bg color but opacity 0 removes the bg
                    }}
                  >
                    {option}
                  </Highlight>
                </UnstyledButton>
              );
            }
          })}
        </ScrollArea.Autosize>
      )}
    </div>
  );
}
