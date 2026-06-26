import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const ProjectPageSkeleton = () => {
  return (
    <div
      className={cn(
        "p-8",
        "flex flex-col gap-8",
        "size-full",
        "bg-muted"
      )}
    >
      <div
        className={cn("flex flex-col gap-1")}
      >
        <Skeleton className={cn("w-[10rem] h-[2rem] bg-card")} />
        <Skeleton className={cn("w-[5rem] h-[1.4rem] bg-card")} />
      </div>
      <div
        className={cn("flex flex-col gap-4")}
      >
        <Skeleton className={cn("w-[6rem] h-[1.4rem] bg-card")} />
        <div
          className={cn("flex flex-wrap gap-4")}
        >
          {Array.from({ length : 6 }).map( (_, index) => <Skeleton key={index} className={cn("w-[10rem] h-[4rem] bg-card")} /> )}
        </div>
      </div>
    </div>
  )
}

export default ProjectPageSkeleton;