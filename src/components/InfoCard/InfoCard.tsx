import React, { useState, useEffect } from 'react';

type InfoCardProps = {
  cardVisible: boolean;
  onClose: () => void;  
};


function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);
  
    useEffect(() => {
      function handleResize() {
        setWidth(window.innerWidth);
      }
      window.addEventListener('resize', handleResize);
      // cleanup
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    return width;
  }

function InfoCard(props: InfoCardProps) {
  const { cardVisible, onClose } = props;
  const width = useWindowWidth();

  // Dummy data for demonstration
  const greeting = 'Hello Function Component!';
  const courseTitle = 'Advanced Programming for Information Technology';
  const courseMeetTimes = 'TR 8:30am - 9:50am';
  const courseInstructor = 'Halper, Michael';
  const courseSeats = '35/42';
  const courseLocation = 'CKB 214';
  const courseSection = 'IT114 - 006';

  // Track position of the card
  const [position, setPosition] = useState({ x: 300, y: 100 });
  // Track if we're currently dragging
  const [isDragging, setIsDragging] = useState(false);
  // Track the offset between cursor and top-left corner of the card
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Mouse move handler for dragging
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
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

  if (width > 1200) {
    return (
        <div
          // Attach mouse down to the outer container
          onMouseDown={handleMouseDown}
          // Fixed positioning so it floats over content
          className="fixed z-50 bg-[#EAEAEA] w-1/4 rounded-[20px] aspect-[9/11] p-0 flex flex-col items-start justify-center space-y-2 max-w-[320px] max-h-[400px]"
          style={{
            // Dynamically position the card at (x, y)
            top: position.y,
            left: position.x,
          }}
        >
          <div className="close-icon flex justify-end w-full pr-5 pt-2">
            <img
              src="/icons/close.png"
              alt="Close Icon"
              className="w-[20px] aspect-square cursor-pointer"
              onClick={ onClose }
            />
          </div>
    
          <div className="course-title flex justify-end w-full pl-8">
              <p className="font-bold text-base">{courseTitle}</p>
          </div>
    
          <div className="flex flex-row items-left space-x-2 justify-center p-2">
            <img src="/icons/time.png" alt="Clock Icon" className="w-[40px] aspect-square" />
            <p>{courseMeetTimes}</p>
          </div>
    
          <div className="flex flex-row items-center space-x-2 p-2">
            <img src="/icons/instructor.png" alt="Instructor Icon" className="w-[40px] aspect-square"/>
            <p>{courseInstructor}</p>
          </div>
    
          <div className="flex flex-row items-center space-x-2 p-2">
            <img src="/icons/seats.png" alt="Seat Icon" className="w-[40px] aspect-square"/>
            <p>{courseSeats}</p>
          </div>
    
          <div className="flex flex-row items-center space-x-2 p-2">
            <img src="/icons/location.png" alt="Location Icon" className="w-[40px] aspect-square"/>
            <p>{courseLocation}</p>
          </div>
    
          <div className="flex flex-row items-center space-x-2 p-2">
            <img src="/icons/section.png" alt="Section Icon" className="w-[40px] aspect-square"/>
            <p>{courseSection}</p>
          </div>
        </div>
      );
  }
  else {
    return (
        <div className="fixed z-50 bg-[#EAEAEA] w-full h-full flex flex-col items-start space-y-2 pl-4">
          <div className="close-icon flex justify-end w-full pr-5 pt-2">
            <img
              src="/icons/close.png"
              alt="Close Icon"
              className="w-[20px] aspect-square cursor-pointer"
              onClick={ onClose }
            />
          </div>
    
          <div className="course-title flex justify-end w-full pl-8">
              <p className="font-bold text-base">{courseTitle}</p>
          </div>
    
          <div className="flex flex-row items-left space-x-2 justify-center p-2">
            <img src="/icons/time.png" alt="Clock Icon" className="w-[40px] aspect-square" />
            <p>{courseMeetTimes}</p>
          </div>
    
          <div className="flex flex-row items-center space-x-2 p-2">
            <img src="/icons/instructor.png" alt="Instructor Icon" className="w-[40px] aspect-square"/>
            <p>{courseInstructor}</p>
          </div>
    
          <div className="flex flex-row items-center space-x-2 p-2">
            <img src="/icons/seats.png" alt="Seat Icon" className="w-[40px] aspect-square"/>
            <p>{courseSeats}</p>
          </div>
    
          <div className="flex flex-row items-center space-x-2 p-2">
            <img src="/icons/location.png" alt="Location Icon" className="w-[40px] aspect-square"/>
            <p>{courseLocation}</p>
          </div>
    
          <div className="flex flex-row items-center space-x-2 p-2">
            <img src="/icons/section.png" alt="Section Icon" className="w-[40px] aspect-square"/>
            <p>{courseSection}</p>
          </div>
        </div>
    );
  }
}

export default InfoCard;
