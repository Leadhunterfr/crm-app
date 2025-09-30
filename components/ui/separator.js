import * as React from "react";

export function Separator({ className = "", ...props }) {
  return (
    <div
      className={`shrink-0 bg-slate-200 dark:bg-slate-700 ${className}`}
      style={{ height: "1px", width: "100%" }}
      {...props}
    />
  );
}
