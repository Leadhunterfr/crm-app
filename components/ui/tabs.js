import * as React from "react";

export function Tabs({ children, defaultValue }) {
  const [active, setActive] = React.useState(defaultValue);
  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { active, setActive })
      )}
    </div>
  );
}

export function TabsList({ children }) {
  return <div className="flex border-b">{children}</div>;
}

export function TabsTrigger({ value, active, setActive, children }) {
  const isActive = active === value;
  return (
    <button
      onClick={() => setActive(value)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, active, children }) {
  if (active !== value) return null;
  return <div className="p-4">{children}</div>;
}
