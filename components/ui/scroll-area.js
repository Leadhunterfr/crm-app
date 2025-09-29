export function ScrollArea({ children, className }) {
  return (
    <div className={`overflow-y-auto ${className}`} style={{ maxHeight: "400px" }}>
      {children}
    </div>
  );
}
