import { ArrowRight, Checkmark } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import { AUTH_COPY } from "@/lib/data/auth/shared";

interface Props {
    label: string;
    pendingLabel?: string;
    doneLabel?: string;
    pending?: boolean;
    done?: boolean;
}

export default function AuthSubmit({ label, pendingLabel, doneLabel, pending = false, done = false }: Props) {
    return (
        <Button
            type="submit"
            size="wide"
            hint={AUTH_COPY.enter}
            trailing={done ? Checkmark : pending ? undefined : ArrowRight}
            pending={pending || done}
            pendingLabel={done ? doneLabel : pendingLabel}
        >
            {label}
        </Button>
    );
}
