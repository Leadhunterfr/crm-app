// components/ui/switch.js
import * as SwitchPrimitives from "@radix-ui/react-switch";

export function Switch({ id, checked, onCheckedChange }) {
  return (
    <SwitchPrimitives.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="relative h-6 w-11 rounded-full bg-slate-300 dark:bg-slate-600 data-[state=checked]:bg-blue-600 transition-colors"
    >
      <SwitchPrimitives.Thumb className="block h-5 w-5 bg-white rounded-full shadow transform translate-x-0.5 data-[state=checked]:translate-x-5 transition-transform" />
    </SwitchPrimitives.Root>
  );
}
