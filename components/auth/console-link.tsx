import { ArrowRight } from "@carbon/icons-react";
import ButtonLink from "@/components/ui/button-link";

interface Props {
    href: string;
    label: string;
}

export default function ConsoleLink({ href, label }: Props) {
    return (
        <ButtonLink href={href} size="wide" trailing={ArrowRight}>
            {label}
        </ButtonLink>
    );
}
