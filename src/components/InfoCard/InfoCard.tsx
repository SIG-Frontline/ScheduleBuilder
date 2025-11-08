import React, { useState, useEffect } from 'react';
import Icon from '../Icon/Icon';
import { Paper, Stack } from '@mantine/core';

import { useViewportSize } from '@mantine/hooks';
import { ActionIcon } from '@mantine/core';

type InfoCardProps = {
  cardVisible: boolean;
  courseInfo: Map<string, string>;
  onClose: () => void;
};

function msToTime(duration: number): string {
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours24 = Math.floor((duration / (1000 * 60 * 60)) % 24);

  const hours12 = hours24 > 12 ? hours24 - 12 : hours24 === 0 ? 12 : hours24;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

  const period = hours24 >= 12 ? 'pm' : 'am';
  const timeOfDay = `${hours12}:${minutesStr}${period}`;

  return timeOfDay;
}

function InfoCard(props: InfoCardProps) {
  const { cardVisible, courseInfo, onClose } = props;
  const { height, width } = useViewportSize();

  const [position, setPosition] = useState({ x: 300, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log('Width changed');
    if (width < 640) {
      setPosition({ x: 0, y: 0 });
    } else setPosition({ x: position.x, y: position.y });
  }, [width, position.x, position.y]);

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
      e.preventDefault(); // To prevent text highlighting
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      setPosition({ x: newX, y: newY });
    };

    // Mouse up handler to end dragging
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Listen to mousemove and mouseup on window
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Clean up event listeners on unmount or when isDragging changes
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset, width]);

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
  const startTime: string = msToTime(
    parseInt(courseInfo.get('startTime') ?? '0'),
  );
  const endTime: string = msToTime(parseInt(courseInfo.get('endTime') ?? '0'));

  // If not visible, render nothing
  if (!cardVisible) return null;
  return (
    <Paper
      shadow="lg"
      radius="xl"
      withBorder
      aria-label="course-info-card"
      className="drag-header fixed z-50 w-full h-full sm:w-1/3 sm:h-fit rounded-[20px] aspect-[9/11] p-0 flex flex-col items-start justify-top sm:pt-0 pt-20 space-y-2 sm:max-w-[250px] sm:max-h-[300px]"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <Paper
        bg="transparent"
        shadow="none"
        radius="xl"
        className=""
        onMouseDown={handleMouseDown}
      >
        <div className="flex justify-between items-center w-full p-3 pr-4 pl-5">
          <p className="font-bold text-center pr-1">
            {courseInfo.get('title')}
          </p>
          <ActionIcon
            variant="transparent"
            className="close-icon"
            color="gray"
            size="xs"
            onClick={onClose}
            aria-label="close"
          >
            <Icon className="sm:text-black">close</Icon>
          </ActionIcon>
        </div>
      </Paper>

      <Stack align="flex-start">
        {courseInfo.get('location') == 'Online' || (
          <div className="flex flex-row items-left space-x-2 pl-2 ">
            <Icon>schedule</Icon>
            <p>{`${startTime} - ${endTime}`}</p>
          </div>
        )}
        <div className="flex flex-row items-center space-x-2 pl-2">
          <Icon>person</Icon>
          <p>{courseInfo.get('instructor')}</p>
        </div>

        <div className="flex flex-row items-center space-x-2 pl-2">
          <Icon>location_on</Icon>
          <p>{courseInfo.get('location')}</p>
        </div>
        <div className="flex flex-row items-center space-x-2 pl-2">
          <Icon>tag</Icon>
          <p>CRN: {courseInfo.get('crn')}</p>
        </div>
        <div className="flex flex-row items-center space-x-2 pl-2">
          <Icon>chair</Icon>
          <p>
            Seats: {courseInfo.get('currentSeats')}/{' '}
            {courseInfo.get('maxSeats')}
          </p>
        </div>
      </Stack>
    </Paper>
  );
}

export default InfoCard;
