import { cn } from "@/lib/utils";

export function Alert({ children, className, ...props }) {
  return (
    <div
      className={cn("rounded-md border border-red-200 bg-red-50 p-4 text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children }) {
  return <p className="text-red-700">{children}</p>;
}
