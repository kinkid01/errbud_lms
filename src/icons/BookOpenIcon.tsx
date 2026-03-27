import React from "react";

interface BookOpenIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const BookOpenIcon: React.FC<BookOpenIconProps> = ({ 
  className = "", 
  width = 24, 
  height = 24 
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 7.5C10.5 6.5 8.5 6 6.5 6C5.5 6 4.5 6.2 3.5 6.5V18.5C4.5 18.2 5.5 18 6.5 18C8.5 18 10.5 18.5 12 19.5C13.5 18.5 15.5 18 17.5 18C18.5 18 19.5 18.2 20.5 18.5V6.5C19.5 6.2 18.5 6 17.5 6C15.5 6 13.5 6.5 12 7.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 7.5V19.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BookOpenIcon;
