import clsx from "clsx";
import { Checkmark } from "@carbon/icons-react";

interface Props {
    id: string;
    rule: string;
    met: boolean;
}

export default function PasswordRule({ id, rule, met }: Props) {
    return (
        <span id={id} className={clsx("haulr-label flex items-center gap-1.5 transition-colors", met ? "text-accent" : "text-text-muted")}>
            <Checkmark aria-hidden className={clsx("size-3 transition-opacity", met ? "opacity-100" : "opacity-0")} />
            {rule}
        </span>
    );
}
