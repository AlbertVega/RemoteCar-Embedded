import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {

  variant?: "default" | "outline" | "destructive" | "secondary"
  size?: "sm" | "md" | "lg"
}


export default function Button({ variant = "default", className, ...props }: ButtonProps) {
  const styles =
    variant === "outline"
      ? "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium ${styles} ${className || ""}`}
      {...props}
    />
  );
}
