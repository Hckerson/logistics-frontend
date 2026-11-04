import WorkspacePage from "@/components/common/workspace-page";
import Skeleton from "@/components/ui/skeleton";

export default function LoadLoading() {
    return (
        <WorkspacePage>
            <div aria-busy className="flex flex-col gap-3">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-7 w-72" />
                <Skeleton lines={2} className="max-w-xl" />
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
            </div>
        </WorkspacePage>
    );
}
