import { Skeleton } from "@/components/ui/skeleton";

const TaskboardSkeleton = () => {
  // Number of skeleton sections to show
  const skeletonSections = [ 6, 4, 2, 5, 3, 2 ];

  return (
    <div className="flex gap-6 px-6 overflow-x-auto overflow-y-hidden">
      {skeletonSections.map((count, sectionIndex) => (
        <div key={sectionIndex} className="w-[20rem] flex-shrink-0 space-y-3">
          {/* Section Header */}
          <Skeleton className="bg-accent-foreground/10 h-10 w-full" />
          
          {/* Task Cards */}
          <div className="space-y-4">
            {Array.from({ length: count })
              .map((_, cardIndex) => (
              <Skeleton key={cardIndex} className="bg-accent-foreground/10 h-28 w-full rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskboardSkeleton;