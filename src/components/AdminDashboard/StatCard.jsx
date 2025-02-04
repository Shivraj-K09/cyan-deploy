import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import * as Icons from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  }
  if (num >= 100000) {
    return (num / 1000).toFixed(0) + "k";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
};

const formatValue = (value) => {
  const numValue = Number.parseInt(value.replace(/,/g, ""), 10);
  if (numValue >= 100000) {
    return (numValue / 1000).toFixed(1) + "k";
  }
  return value;
};

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  fullWidth,
}) {
  const Icon = Icons[icon];
  const formattedValue = formatValue(value);

  return (
    <div
      className={`border border-gray-300 rounded-lg flex items-center ${
        fullWidth ? "col-span-2" : ""
      }`}
    >
      <div className="p-3">
        <div className="rounded-lg p-2">
          <Icon className="w-5 h-5 text-[#6e6e6e]" />
        </div>
      </div>
      <div className="flex-grow border-l border-gray-300 h-full p-3">
        <h3 className="text-[10px] font-medium text-gray-500 truncate">
          {title}
        </h3>
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-base font-bold text-gray-800 cursor-help">
                  {formatLargeNumber(Number.parseInt(value.replace(/,/g, "")))}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Full value:{" "}
                  {Number.parseInt(value.replace(/,/g, "")).toLocaleString()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span
            className={`ml-2 text-[12px] font-medium flex items-center ${
              changeType === "increase" ? "text-green-600" : "text-red-600"
            }`}
          >
            {changeType === "increase" ? (
              <ArrowUp size={12} />
            ) : (
              <ArrowDown size={12} />
            )}
            <span className="ml-1">{change}%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
