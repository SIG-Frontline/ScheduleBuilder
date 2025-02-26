import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea, TextInput, UnstyledButton } from "@mantine/core";
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
  const [debouncedTextBoxValue] = useDebouncedValue(textBoxValue, 500);
  const textBoxRef = useRef<HTMLInputElement>(null);
  const [classOptions, setClassOptions] = useState<
    { id: string; title: string; subject: string }[] | string[]
  >([]);
  const [searchByTitle, setSearchByTitle] = useState(false);
  const subjectOptions = subject_store.subjects;
  const [selectedSubject, setSelectedSubject] = useState<string>("");
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
        // setSubjectOptions(courses);
        subject_store.setSubjects(courses, selectedPlan?.term ?? 0);
      });
    }
  }, [selectedPlan?.term, subjectOptions.length, subject_store]); //on mount - no dependencies

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

  const handleClassSelection = (searchResult: {
    id: string;
    subject: string;
    title: string;
  }) => {
    //if the option is a class, and there is a subject selected, and the subject is in the textbox
    if (specialSubjects.includes(searchResult.subject)) {
      searchResult.title = "";
    }
    getSectionData(
      selectedPlan?.term ?? 202490,
      searchResult.subject,
      searchResult.id
    )
      .then((data) => {
        data.color = `rgba(
          ${Math.floor(Math.random() * 256)},
          ${Math.floor(Math.random() * 256)},
          ${Math.floor(Math.random() * 256)},0.9)`;
        addCourseToPlan(data);
      })
      .then(() => {
        setTextBoxValue("");
      });
    //focus the textbox after selecting a search option
    setTimeout(() => {
      textBoxRef.current?.focus();
    }, 10);
  };

  const highlightMatchingText = (searchResultText: string, searchInput: string) => {
    if (!searchInput.trim()) return searchResultText;

    const searchWords = searchInput.trim().split(/\s+/).filter((word) => word.length > 0); // Split search input into words
    if (searchWords.length === 0) return searchResultText;
    
    const regex = new RegExp(`(${searchWords.join("|")})`, "gi"); // Match any word from input
    const parts = searchResultText.split(regex);

    return parts.map((part, index) => {
      return searchWords.some((word) => part.toLowerCase() === word.toLowerCase()) ? (
        <strong key={index} className="font-bold text-black">{part}</strong>
      ) : (
        <span key={index}>{part}</span>
      );
    })
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
        label=""
        placeholder="Search for a course"
        value={textBoxValue}
        onChange={(e) => {
          // capitalizes textbox value && changes it only if the value has changed
          const newValue = e.currentTarget.value.toUpperCase();
          if (newValue !== textBoxValue) {
            setTextBoxValue(newValue);
            setTextHovered(-1);
          }
        }}
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
                  w={"100%"}
                  px={12}
                  py={6}
                  bg={
                    index === textHovered
                      ? "var(--mantine-color-blue-light)"
                      : undefined
                  }
                >
                  {highlightMatchingText(`${option.subject} ${option.id} ${option.title}`, textBoxValue)}
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
                  w={"100%"}
                  px={12}
                  py={6}
                  bg={
                    index === textHovered
                      ? "var(--mantine-color-blue-light)"
                      : undefined
                  }
                >
                  {highlightMatchingText(`${option}`, textBoxValue)}
                </UnstyledButton>
              );
            }
          })}
        </ScrollArea.Autosize>
      )}
    </div>
  );
}
