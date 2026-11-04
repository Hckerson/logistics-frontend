import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function WorkspacePage({ children }: Props) {
    return <div className="haulr-shell flex flex-col gap-4 py-6">{children}</div>;
}
