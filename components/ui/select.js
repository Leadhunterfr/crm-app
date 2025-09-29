import * as React from "react";

export function Select({ value, onValueChange, children }) {
  return <select value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</select>;
}

export function SelectTrigger({ children, className }) {
  return <div className={`border px-3 py-2 rounded-md ${className}`}>{children}</div>;
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

export function SelectValue({ placeholder }) {
  return <span>{placeholder}</span>;
}
