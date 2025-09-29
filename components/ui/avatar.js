export function Avatar({ children, className }) {
  return <div className={`inline-flex items-center justify-center rounded-full bg-slate-200 ${className}`}>{children}</div>;
}

export function AvatarFallback({ children, className }) {
  return <span className={`text-xs font-medium ${className}`}>{children}</span>;
}
