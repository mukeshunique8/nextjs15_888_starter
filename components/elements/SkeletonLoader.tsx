import React from "react";

interface SkeletonLoaderProps {
  variant?: "project" | "card" | "text";
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = "card", className = "" }) => {
  if (variant === "project") {
    return (
      <div className={`flex flex-col md:flex-row gap-8 ${className}`}>
        {/* Image skeleton with lightning effect */}
        <div className="relative w-full md:w-1/2 aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>

        {/* Content skeleton */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />

          {/* Tech stack skeleton */}
          <div className="flex flex-wrap gap-2 py-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            ))}
          </div>

          {/* Buttons skeleton */}
          <div className="flex gap-4 pt-2">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
    </div>
  );
};

export default SkeletonLoader;
