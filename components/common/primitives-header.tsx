import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";

const { kicker, title, lead } = PRIMITIVES_COPY;

export default function PrimitivesHeader() {
    return (
        <header className="border-border flex flex-col gap-2 border-b pb-6">
            <p className="haulr-label text-accent">{kicker}</p>
            <h1 className="text-text text-h4">{title}</h1>
            <p className="text-text-secondary max-w-2xl text-xs leading-relaxed">{lead}</p>
        </header>
    );
}
