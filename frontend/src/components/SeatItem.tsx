import React from "react";
import { cn } from "./ui/utils";
import { SeatInfo } from "../services/seat.service";

interface SeatItemProps {
  seat: SeatInfo;
  isSelected: boolean;
  onSelect: (seat: SeatInfo) => void;
  isLoading?: boolean;
}

export const SeatItem: React.FC<SeatItemProps> = React.memo(({ seat, isSelected, onSelect, isLoading }) => {
  const getStatusColor = () => {
    if (isSelected) return "bg-blue-500 text-white border-blue-600";
    switch (seat.status) {
      case "available":
        return "bg-green-100 text-green-700 border-green-300 hover:bg-green-200";
      case "booked":
        return "bg-red-100 text-red-500 border-red-200 cursor-not-allowed opacity-60";
      case "locked":
        return "bg-yellow-100 text-yellow-600 border-yellow-200 cursor-not-allowed opacity-60";
      default:
        return "bg-gray-100 text-gray-400 border-gray-200";
    }
  };

  const isDisabled = seat.status !== "available" || isLoading;

  return (
    <button
      onClick={() => onSelect(seat)}
      disabled={isDisabled && !isSelected}
      className={cn(
        "w-12 h-12 m-1 flex items-center justify-center rounded-md border transition-all duration-200 text-xs font-bold relative",
        getStatusColor(),
        isLoading && "animate-pulse"
      )}
      title={`Seat ${seat.seatNumber} - ${seat.status}`}
    >
      {seat.seatNumber}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-md">
           <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
});

SeatItem.displayName = "SeatItem";
