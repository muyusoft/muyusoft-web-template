import { ICON_REGISTRY, type IconName } from "@/shared/icons/icon-registry";
import { cn } from "@/shared/utils/cn.utils";

const ICON_SIZES = { sm: "size-4", md: "size-5", lg: "size-6", xl: "size-8" } as const;

interface IconProps {
  name: IconName;
  size?: keyof typeof ICON_SIZES;
  className?: string;
  /** Pass only when the icon is the sole content of its control; otherwise it stays decorative. */
  label?: string;
}

export function Icon({ name, size = "md", className, label }: IconProps) {
  const Component = ICON_REGISTRY[name];
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return <Component className={cn(ICON_SIZES[size], className)} {...a11y} />;
}
