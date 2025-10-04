import * as React from "react";

interface SliderProps {
  value: number;                        // el valor actual del slider
  onChange: (value: number) => void;    // función para actualizar el valor
  min?: number;                        
  max?: number;                        
  step?: number;                        
  className?: string;                   
}


export default function Slider({ value, onChange, min = 0, max = 100, step = 1 }: SliderProps) {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-blue-600"
    />
  );
}

