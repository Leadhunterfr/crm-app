import * as React from "react";

export const Label = React.forwardRef(({ className = "", ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium text-slate-700 dark:text-slate-300 ${className}`}
    {...props}
  />
));
Label.displayName = "Label";
