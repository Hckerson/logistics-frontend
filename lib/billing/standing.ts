import type { StandingBlockerDto } from "@/lib/contract/schemas";
import { STANDING_COPY } from "@/lib/data/billing/standing-copy";
import { UI_LOCALE } from "@/lib/ui/constants";
import type { StandingCapability } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

const copy = STANDING_COPY;
const day = new Intl.DateTimeFormat(UI_LOCALE, { month: "short", day: "numeric" });

const affected = (capabilities: StandingBlockerDto["capabilities"]) => capabilities.map((capability) => copy.capabilities[capability]).join(copy.and);

export const consequenceOf = ({ severity, capabilities, effectiveAt }: StandingBlockerDto, organisation: string) => {
    const list = affected(capabilities);
    if (severity === "blocking") return fillTemplate(copy.blocking, { organisation, capabilities: list });
    const sentence = list.charAt(0).toUpperCase() + list.slice(1);
    return effectiveAt ? fillTemplate(copy.warningOn, { capabilities: sentence, date: day.format(Date.parse(effectiveAt)) }) : fillTemplate(copy.warning, { capabilities: sentence });
};

export const relevantTo = (blocker: StandingBlockerDto, capabilities: readonly StandingCapability[] | undefined) =>
    !capabilities || blocker.capabilities.some((capability) => capabilities.includes(capability));
