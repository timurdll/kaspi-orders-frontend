import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      {...props}
      className={`w-[100px] h-[30px] bg-[#1869FF] text-white font-medium rounded-none hover:bg-[#155CC3] focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
};
