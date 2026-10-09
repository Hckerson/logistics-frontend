import clsx from "clsx";
import { Checkmark } from "@carbon/icons-react";

interface Props {
    id: string;
    rule: string;
    met: boolean;
}

export default function PasswordRule({ id, rule, met }: Props) {
    return (
        <span id={id} className={clsx("haulr-label flex items-center whitespace-nowrap transition-colors", met ? "text-accent" : "text-text-muted")}>
            <Checkmark aria-hidden className={clsx("h-3 shrink-0 transition-all", met ? "mr-1.5 w-3 opacity-100" : "w-0 opacity-0")} />
            {rule}
        </span>
    );
}
