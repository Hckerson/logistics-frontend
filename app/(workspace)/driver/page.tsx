import type { Metadata } from "next";
import DriverHome from "@/components/common/driver-home";
import WorkspacePage from "@/components/common/workspace-page";
import { DRIVER_COPY } from "@/lib/data/driver/copy";

export const metadata: Metadata = { title: DRIVER_COPY.home.meta };

export default function DriverHomePage() {
    return (
        <WorkspacePage>
            <DriverHome />
        </WorkspacePage>
    );
}
