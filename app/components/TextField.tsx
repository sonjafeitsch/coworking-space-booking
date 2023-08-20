import type { InputHTMLAttributes } from "react";

export function TextField({
  label,
  id,
  className,
  hidden,
  ...otherProps
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
}) {
  return (
    <div className={className}>
      <label
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-text-secondary focus:border-text-secondary block w-full p-2.5"
        id={id}
        {...otherProps}
      />
    </div>
  );
}
