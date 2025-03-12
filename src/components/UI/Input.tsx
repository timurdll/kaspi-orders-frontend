import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
  return (
    <input
      {...props}
      className={`max-w-[245px] h-[42px] w-full px-3 py-2 border-[1.5px] border-[#707070] focus:border-[#1869FF] outline-none placeholder-[#707070] text-black ${className}`}
    />
  );
};
