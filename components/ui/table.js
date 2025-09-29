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
