import { Train, Clock, MapPin } from 'lucide-react';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function TrainCardSkeleton() {
  return (
    <Card className="p-6 border-0 shadow-md">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Route Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Route */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            
            <div className="flex flex-col items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Right: Price & Action */}
        <div className="flex flex-col items-end justify-between gap-4 md:min-w-[200px]">
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-8 w-32 ml-auto" />
            <Skeleton className="h-4 w-28 ml-auto" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </Card>
  );
}

export function SearchResultsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <TrainCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SeatMapLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(32)].map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function BookingFormLoading() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <Card key={i} className="p-6 border-0 shadow-md">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function FullPageLoader({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
          <Train className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-lg font-medium text-gray-700">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Vui lòng chờ trong giây lát...</p>
      </div>
    </div>
  );
}
