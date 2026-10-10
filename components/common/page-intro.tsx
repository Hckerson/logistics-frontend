interface Props {
    eyebrow: string;
    title: string;
    lead: string;
}

export default function PageIntro({ eyebrow, title, lead }: Props) {
    return (
        <header className="flex max-w-3xl flex-col gap-4">
            <p className="haulr-label text-accent-dark">{eyebrow}</p>
            <h1 className="haulr-title text-text overflow-hidden pb-[0.08em]">
                <span className="haulr-rise block">{title}</span>
            </h1>
            <p className="text-text-secondary max-w-xl text-(length:--haulr-lead) text-pretty">{lead}</p>
        </header>
    );
}
