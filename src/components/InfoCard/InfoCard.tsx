import React, { useState, useEffect } from "react";
import Icon from "../Icon/Icon";
import { Button, Stack } from "@mantine/core";

import { useViewportSize } from "@mantine/hooks";

type InfoCardProps = {
  cardVisible: boolean;
  courseInfo: Map<String, String>;
  onClose: () => void;
};

function msToTime(duration) {
  var minutes: number = Math.floor((duration / (1000 * 60)) % 60),
    hours: number = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours > 12 ? hours - 12 : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let timeOfDay =
    hours >= 12 ? hours + ":" + minutes + "pm" : hours + ":" + minutes + "am";
  return timeOfDay;
}

function InfoCard(props: InfoCardProps) {
  const { cardVisible, courseInfo, onClose } = props;
  const { height, width } = useViewportSize();

  const [position, setPosition] = useState({ x: 300, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log("Width changed");
    if (width < 640) {
      setPosition({ x: 0, y: 0 });
    } else setPosition({ x: position.x, y: position.y });
  }, [width]);

  function cardOffscreen() {
    let offScreen = false;

    if (
      position.x <= -200 ||
      position.x >= width - 350 ||
      position.y <= 20 ||
      position.y > height - 50
    ) {
      offScreen = true;
    }

    return offScreen;
  }

  const badCardPosition: boolean =
    cardOffscreen() && !isDragging && width > 640;

  useEffect(() => {
    if (badCardPosition) {
      setPosition({ x: 300, y: 100 });
    }
  }, [badCardPosition]);

  useEffect(() => {
    // Mouse move handler for dragging
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || width < 640) return;
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      setPosition({ x: newX, y: newY });
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
    if (width < 640) return;

    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    // Calculate the offset between card's current position and the cursor
  };

  let startTime: number = msToTime(parseInt(courseInfo.get("startTime")));
  let endTime: number = msToTime(parseInt(courseInfo.get("endTime")));

  // If not visible, render nothing
  if (!cardVisible) return null;
  return (
    <div
      aria-label="course-info-card"
      className="drag-header fixed z-50 bg-[#EAEAEA] dark:bg-[#636363] w-full h-full sm:w-1/5 sm:h-fit rounded-[20px] aspect-[9/11] p-0 flex flex-col items-start justify-top sm:pt-0 pt-20 space-y-2 sm:max-w-[320px] sm:max-h-[400px]  "
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div
        className="sm:bg-[#B9B9B9] w-full h-fit rounded-t-[20px] sm:cursor-all-scroll sm:pt-0 pt-5"
        onMouseDown={handleMouseDown}
      >
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

          <p>{`${startTime} - ${endTime}`}</p>
        </div>
        <div className="flex flex-row items-center space-x-2 pl-2">
          <Icon>person</Icon>
          <p>{courseInfo.get("instructor")}</p>
        </div>

        <div className="flex flex-row items-center space-x-2 pl-2">
          <Icon>location_on</Icon>
          <p>{courseInfo.get("location")}</p>
        </div>
        <div className="flex flex-row items-center space-x-2 pl-2">
          <Icon>tag</Icon>
          <p>CRN: {courseInfo.get("crn")}</p>
        </div>
      </Stack>
    </div>
  );
}

export default InfoCard;
