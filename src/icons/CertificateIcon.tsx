import React from "react";

interface CertificateIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const CertificateIcon: React.FC<CertificateIconProps> = ({ 
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
        d="M4 4C4 3.44772 4.44772 3 5 3H19C19.5523 3 20 3.44772 20 4V16C20 16.5523 19.5523 17 19 17H12L8 21V17H5C4.44772 17 4 16.5523 4 16V4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CertificateIcon;
