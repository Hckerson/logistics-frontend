import clsx from "clsx";

interface Props {
    name: string;
    value: string;
    title: string;
    detail: string;
    checked: boolean;
    onChoose: () => void;
}

export default function SideOption({ name, value, title, detail, checked, onChoose }: Props) {
    return (
        <label
            className={clsx(
                "has-[:focus-visible]:outline-text flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                checked ? "border-text bg-background-muted/50" : "border-border-dark hover:border-text-muted",
            )}
        >
            <input type="radio" name={name} value={value} checked={checked} onChange={onChoose} className="sr-only" />
            <span
                aria-hidden
                className={clsx(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
                    checked ? "border-text" : "border-text-muted",
                )}
            >
                <span className={clsx("bg-accent size-2 rounded-full transition-transform", checked ? "scale-100" : "scale-0")} />
            </span>
            <span className="flex flex-col gap-0.5">
                <span className="text-text text-sm">{title}</span>
                <span className="text-text-muted text-xs">{detail}</span>
            </span>
        </label>
    );
}
