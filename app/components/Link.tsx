import type { AnchorHTMLAttributes } from "react";

export function Link({
  href,
  children,
  ...otherProps
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className="border-bg-primary border text-white w-full bg-bg-primary hover:border-bg-primary hover:text-bg-primary hover:bg-white focus:ring-4 font-medium rounded-3xl text-sm px-5 py-2.5 mr-2 mb-2 focus:ring-transparent focus:outline-none flex justify-center"
      {...otherProps}
    >
      {children}
    </a>
  );
}

export function SecondaryLink({
  href,
  children,
  ...otherProps
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className="border-bg-primary border bg-white text-bg-primary w-full hover:bg-bg-primary hover:text-white focus:ring-4 font-medium rounded-3xl text-sm px-5 py-2.5 mr-2 mb-2 focus:ring-transparent focus:outline-none flex justify-center"
      {...otherProps}
    >
      {children}
    </a>
  );
}
