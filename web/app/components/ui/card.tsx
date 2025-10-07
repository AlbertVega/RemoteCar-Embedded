import * as React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={` "rounded-2xl border border-gray-900/80 bg-gray-900 text-white shadow-lg",${className || ""}`}>
      {children}
    </div>
  );
}
