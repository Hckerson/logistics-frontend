import type { ReactNode } from "react";

interface Props {
    title: string;
    children?: ReactNode;
}

export default function WorkspaceHeading({ title, children }: Props) {
    return (
        <header className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-text text-h5 tracking-tight">{title}</h1>
            {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
        </header>
    );
}
