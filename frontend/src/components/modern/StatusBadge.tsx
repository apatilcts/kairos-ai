'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800 ring-1 ring-green-600/20",
        warning: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20", 
        error: "bg-red-100 text-red-800 ring-1 ring-red-600/20",
        info: "bg-blue-100 text-blue-800 ring-1 ring-blue-600/20",
        purple: "bg-purple-100 text-purple-800 ring-1 ring-purple-600/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      hasIcon: {
        true: "pl-1.5",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      hasIcon: false,
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  icon?: React.ReactNode;
  pulse?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, size, hasIcon, icon, pulse, children, ...props }, ref) => {
    return (
      <span
        className={cn(
          statusBadgeVariants({ variant, size, hasIcon: !!icon, className }),
          pulse && "animate-pulse"
        )}
        ref={ref}
        {...props}
      >
        {icon && (
          <span className="mr-1">
            {icon}
          </span>
        )}
        {children}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };