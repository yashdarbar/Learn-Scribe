import * as React from "react";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-border",
        orientation === "horizontal"
          ? "h-px w-full my-4"
          : "w-px h-full mx-4",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";