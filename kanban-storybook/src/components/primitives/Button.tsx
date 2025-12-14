import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "muted" };

const Button: React.FC<Props> = ({ children, variant = "primary", className, ...rest }) => {
  return (
    <button
      {...rest}
      className={clsx(
        "px-3 py-2 rounded-md text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1",
        variant === "primary" ? "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-300" : "bg-gray-100 text-gray-800",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
