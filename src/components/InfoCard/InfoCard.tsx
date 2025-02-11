import React, { useState, useEffect } from "react";
import Icon from "../Icon/Icon";
import { Button, Stack } from "@mantine/core";

import { useViewportSize } from "@mantine/hooks";

type InfoCardProps = {
  cardVisible: boolean;
  courseInfo: Map<String, String>;
  onClose: () => void;
};

function InfoCard(props: InfoCardProps) {
  const { cardVisible, courseInfo, onClose } = props;
  const { height, width } = useViewportSize();

  // Track position of the card
  const [position, setPosition] = useState({ x: 300, y: 100 });
  // Track if we're currently dragging
  const [isDragging, setIsDragging] = useState(false);
  // Track the offset between cursor and top-left corner of the card
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [isDraggable, setIsDraggable] = useState(true);

  useEffect(() => {
    // Mouse move handler for dragging
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      if (width > 1024) {
        setPosition({ x: newX, y: newY });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    };

    // Mouse up handler to end dragging
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Listen to mousemove and mouseup on window
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Clean up event listeners on unmount or when isDragging changes
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  // Start drag
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only left-mouse button (if you want to restrict)
    if (e.button !== 0) return;

    setIsDragging(true);
    // Calculate the offset between card's current position and the cursor
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // If not visible, render nothing
  if (!cardVisible) return null;
  return (
    <div
      aria-label="course-info-card"
      onMouseDown={handleMouseDown}
      className="fixed z-50 bg-[#EAEAEA] w-full h-full lg:w-1/5 lg:h-fit rounded-[20px] aspect-[9/11] p-0 flex flex-col items-start justify-center space-y-2 lg:max-w-[320px] lg:max-h-[400px] cursor-all-scroll"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="bg-[#B9B9B9] w-full h-fit rounded-t-[20px]">
        <div className="flex justify-end w-full pr-1 pt-2 pb-2">
          <Button
            variant="transparent"
            className="close-icon"
            color="gray"
            size="xs"
            onClick={onClose}
            aria-label="close"
          >
            <Icon className="text-black">close</Icon>
          </Button>
        </div>
      </div>
      <div className="course-title flex w-full p-4">
        <p className="font-bold text-base">{courseInfo.get("title")}</p>
      </div>

      <Stack align="flex-start">
        <div className="flex flex-row items-left space-x-2 pl-2 ">
          <Icon>schedule</Icon>
          <p>TODO: Add meeting times</p>
        </div>
        <div className="flex flex-row items-center space-x-2 pl-2">
          <Icon>person</Icon>
          <p>{courseInfo.get("instructor")}</p>
        </div>
        {/* <div className="flex flex-row items-center space-x-2 pl-2">
              <Icon>chair_alt</Icon>
              <p>{courseSeats}</p>
            </div> */}
        <div className="flex flex-row items-center space-x-2 pl-2">
          <Icon>location_on</Icon>
          <p>{courseInfo.get("location")}</p>
        </div>
        <div className="flex flex-row items-center space-x-2 pl-2">
          <Icon>tag</Icon>
          <p>CRN: {courseInfo.get("crn")}</p>
        </div>
      </Stack>
      <div className="flex justify-end w-full pr-3 pb-3">
        <Button radius="lg" color="gray">
          Other Sections
        </Button>
      </div>
    </div>
  );
}

export default InfoCard;
