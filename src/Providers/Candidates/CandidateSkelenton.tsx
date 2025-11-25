import { Skeleton } from "@/components/ui/skeleton";

export const CaregiverCardSkeleton = () => {
    return (
      <div className="shadow-sm border bg-white border-gray-200 rounded-lg p-4 space-y-4">
        {/* Avatar and Name */}
        <div className="flex items-center space-x-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex flex-col space-y-2">
            <Skeleton className="w-32 h-6 rounded" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
        </div>
  
        {/* Licenses and Availability */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Skeleton className="w-16 h-6 rounded" />
          <Skeleton className="w-20 h-6 rounded" />
          <Skeleton className="w-12 h-6 rounded" />
        </div>
  
        {/* About Section */}
        <div className="space-y-2 mt-4">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-3/4 h-4 rounded" />
        </div>
      </div>
    );
  };