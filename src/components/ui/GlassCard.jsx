import React from "react";
import { cn } from "@/utils";

const GlassCard = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "glass-panel rounded-xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
GlassCard.displayName = "GlassCard";

export { GlassCard };
