import React, { useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useSeatTimer } from '../hooks/useSeatTimer';
import { cn } from './ui/utils';
import { useCartStore } from '../store/cartStore';

interface CountdownDisplayProps {
  expiresAt: number | null;
  onExpire?: () => void;
  className?: string;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ 
  expiresAt, 
  onExpire, 
  className 
}) => {
  const { isExpired, formattedTime, isCritical } = useSeatTimer(expiresAt);
  useEffect(() => {
    if (isExpired) {
      if (onExpire) {
        onExpire();
      }
    }
  }, [isExpired, onExpire]);

  if (!expiresAt) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-sm font-bold shadow-sm transition-colors",
      isCritical 
        ? "bg-red-50 text-red-600 border-red-200 animate-pulse" 
        : "bg-blue-50 text-blue-700 border-blue-200",
      isExpired && "bg-slate-100 text-slate-500 border-slate-200 animate-none",
      className
    )}>
      {isCritical ? <AlertCircle size={16} /> : <Clock size={16} />}
      <span>
        {isExpired ? "ĐÃ HẾT HẠN" : formattedTime}
      </span>
    </div>
  );
};
