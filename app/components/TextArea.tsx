import type { TextareaHTMLAttributes } from "react";

export function TextArea({
  label,
  id,
  className,
  hidden,
  ...otherProps
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
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
      <textarea
        draggable={false}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-text-secondary focus:border-text-secondary block w-full p-2.5 resize-none"
        id={id}
        {...otherProps}
      />
    </div>
  );
}
