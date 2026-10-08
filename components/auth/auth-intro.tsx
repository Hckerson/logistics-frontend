import { HEADLINE_STAGGER } from "@/lib/home/constants";

interface Props {
    title: readonly string[];
    lead: string;
}

export default function AuthIntro({ title, lead }: Props) {
    return (
        <header className="flex max-w-md flex-col gap-5">
            <h1 className="haulr-display text-text">
                {title.map((line, index) => (
                    <span key={line} className="block overflow-hidden pb-[0.08em]">
                        <span className="haulr-rise block" style={{ animationDelay: `${index * HEADLINE_STAGGER}s` }}>
                            {line}{" "}
                        </span>
                    </span>
                ))}
            </h1>
            <p className="text-text-secondary text-(length:--haulr-lead)">{lead}</p>
        </header>
    );
}
