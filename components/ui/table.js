import * as React from "react";

export function Table({ className, ...props }) {
  return <table className={`w-full border-collapse text-sm ${className}`} {...props} />;
}

export function TableHeader({ className, ...props }) {
  return <thead className={`bg-slate-100 ${className}`} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={className} {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={`border-b last:border-0 ${className}`} {...props} />;
}

export function TableHead({ className, ...props }) {
  return <th className={`px-4 py-2 text-left font-medium text-slate-600 ${className}`} {...props} />;
}

export function TableCell({ className, ...props }) {
  return <td className={`px-4 py-2 ${className}`} {...props} />;
}
