import * as React from "react";

export function Tabs({ defaultValue, children }) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { value, setValue })
      )}
    </div>
  );
}

export function TabsList({ children, className }) {
  return <div className={`flex border-b mb-4 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, setValue, children }) {
  return (
    <button
      onClick={() => setValue(value)}
      className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[active=true]:border-blue-500 data-[active=true]:text-blue-600"
      data-active={setValue ? undefined : true}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, setValue, children }) {
  return setValue === value ? <div>{children}</div> : null;
}

// components/ui/table.js
import React from "react";

export function Table({ children, className }) {
  return (
    <table className={`w-full border-collapse ${className || ""}`}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className }) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className }) {
  return <tr className={className}>{children}</tr>;
}

export function TableHead({ children, className }) {
  return (
    <th className={`px-4 py-2 text-left font-medium ${className || ""}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }) {
  return <td className={`px-4 py-2 ${className || ""}`}>{children}</td>;
}
