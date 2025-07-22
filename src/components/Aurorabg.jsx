"use client";
import { cn } from "../lib/utils";
import React from "react";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <main className=" text-black ">
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-white text-slate-950",
          className
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
  "--white-gradient":
    "repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",
  "--aurora":
    "repeating-linear-gradient(100deg, #b3dbfc 10%, #7cc4f8 15%, #4fb0f5 20%, #379fee 25%, #6bbef5 30%)",
  "--blue-300": "#7cc4f8",
  "--blue-400": "#4fb0f5",
  "--blue-500": "#379fee",
  "--indigo-300": "#6bbef5",
  "--violet-200": "#b3dbfc",
  "--white": "#fff",
  "--transparent": "transparent"
}}

        >
          <div
            className={cn(
              `after:animate-aurora pointer-events-none absolute -inset-[10px]
              [background-image:var(--white-gradient),var(--aurora)]
              [background-size:300%,_200%]
              [background-position:50%_50%,50%_50%]
              opacity-50 blur-[10px] invert filter will-change-transform
              [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
              [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
              after:absolute after:inset-0
              after:[background-image:var(--white-gradient),var(--aurora)]
              after:[background-size:200%,_100%]
              after:[background-attachment:fixed]
              after:mix-blend-difference after:content-[""]`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
