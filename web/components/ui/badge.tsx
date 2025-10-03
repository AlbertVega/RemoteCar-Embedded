import * as React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "default" | "success" | "warning" | "error";
  variant?: "default" | "secondary"
  className?: string
}


export default function Badge({ children, color = "default" }: BadgeProps) {
  const styles = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-200 text-green-800",
    warning: "bg-yellow-200 text-yellow-800",
    error: "bg-red-200 text-red-800",
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${styles[color]}`}>
      {children}
    </span>
  );
}
