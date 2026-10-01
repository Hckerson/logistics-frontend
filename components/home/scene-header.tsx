import clsx from "clsx";

interface Props {
    label: string;
    title: string;
    body?: string;
    className?: string;
}

export default function SceneHeader({ label, title, body, className }: Props) {
    return (
        <div className={clsx("flex flex-col gap-4 lg:gap-6", className)}>
            <p className="haulr-label text-accent-dark">{label}</p>
            <h2 className="haulr-title text-text">{title}</h2>
            {body ? <p className="text-text-secondary max-w-md text-(length:--haulr-lead)">{body}</p> : null}
        </div>
    );
}
