// eslint-disable-next-line @typescript-eslint/no-empty-interface

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Avatar.displayName = "Avatar";