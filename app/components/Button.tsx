import type { ButtonHTMLAttributes } from "react";

export function Button({
  children,
  ...otherProps
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="border-bg-primary border text-white w-full bg-bg-primary hover:border-bg-primary hover:text-bg-primary hover:bg-white focus:ring-4 font-medium rounded-3xl text-sm px-5 py-2.5 mr-2 mb-2 focus:ring-transparent focus:outline-none"
      {...otherProps}
    >
      {children}
    </button>
  );
}
