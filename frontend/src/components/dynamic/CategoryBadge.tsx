import React from "react";

interface CategoryBadgeProps {
  category?: string;
  verticalId?: string;
  depthLevel?: string;
  size?: "sm" | "md" | "lg";
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  verticalId,
  depthLevel,
  size = "md",
}) => {
  const getDepthStyle = (level?: string) => {
    if (!level) return "bg-slate-100 text-slate-700 border-slate-200";
    if (level.includes("LEVEL 4")) return "bg-purple-100 text-purple-800 border-purple-300 font-semibold";
    if (level.includes("LEVEL 3")) return "bg-blue-100 text-blue-800 border-blue-300 font-semibold";
    if (level.includes("LEVEL 2")) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {category && (
        <span
          className={`rounded-full border font-medium inline-flex items-center gap-1 ${sizeClasses[size]} bg-slate-50 text-slate-800 border-slate-200`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          {category}
        </span>
      )}
      {verticalId && (
        <span
          className={`rounded-full border uppercase tracking-wider inline-flex items-center ${sizeClasses[size]} ${getDepthStyle(
            depthLevel
          )}`}
        >
          {verticalId.replace(/_/g, " ")}
        </span>
      )}
    </div>
  );
};
