"use client";
import { useState } from "react";
import { ArrowRight, Filter } from "@carbon/icons-react";
import PrimitivesSection from "@/components/common/primitives-section";
import PrimitivesSpecimen from "@/components/common/primitives-specimen";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import IconButton from "@/components/ui/icon-button";
import Menu from "@/components/ui/menu";
import StatusLabel from "@/components/ui/status-label";
import { appRoutes } from "@/lib/app-routes";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { SPECIMEN_ICONS, SPECIMEN_MENU, SPECIMEN_PENDING_MS, SPECIMEN_SIZES, SPECIMEN_TONES } from "@/lib/data/primitives/samples";

const { sections, specimens, tones, demo } = PRIMITIVES_COPY;

export default function PrimitivesActions() {
    const [pending, setPending] = useState(false);
    const [filtered, setFiltered] = useState(false);
    const [chosen, setChosen] = useState<string | null>(null);

    const save = () => {
        setPending(true);
        setTimeout(() => setPending(false), SPECIMEN_PENDING_MS);
    };

    return (
        <PrimitivesSection {...sections.actions}>
            <PrimitivesSpecimen label={specimens.tones} contract="IC-11">
                {SPECIMEN_TONES.map((tone) => (
                    <Button key={tone} tone={tone}>
                        {tones[tone]}
                    </Button>
                ))}
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.states} contract="G-5 · G-6">
                <Button pending={pending} pendingLabel={demo.saving} onPress={save}>
                    {demo.pending}
                </Button>
                <Button tone="outline" disabledReason={demo.lockedReason}>
                    {demo.locked}
                </Button>
                <p className="text-text-muted w-full text-xs">{demo.lockedReason}</p>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.icons} contract="IC-11">
                <IconButton label={demo.copy} icon={SPECIMEN_ICONS.copy} />
                <IconButton label={demo.download} icon={SPECIMEN_ICONS.download} />
                <IconButton label={demo.outline} icon={SPECIMEN_ICONS.share} tone="quiet" />
                <IconButton label={demo.filter} icon={Filter} tone={filtered ? "quiet" : "ghost"} aria-pressed={filtered} onPress={() => setFiltered((on) => !on)} />
                <IconButton label={demo.copy} icon={SPECIMEN_ICONS.edit} size="sm" />
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.sizes} wide>
                {SPECIMEN_SIZES.map((size) => (
                    <Button key={size} size={size} trailing={ArrowRight}>
                        {demo.primary}
                    </Button>
                ))}
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.links} contract="IC-51">
                <ButtonLink href={appRoutes.help()} tone="outline" trailing={ArrowRight}>
                    {demo.link}
                </ButtonLink>
                <ButtonLink href={appRoutes.help()} tone="ghost" size="sm">
                    {demo.link}
                </ButtonLink>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.menu} contract="IC-57">
                <Menu label={demo.menuLabel} items={SPECIMEN_MENU} onAction={setChosen} />
                <Menu label={demo.menuLabel} text={demo.secondary} items={SPECIMEN_MENU} onAction={setChosen} placement="bottom start" />
                {chosen ? <StatusLabel label={chosen} tone="live" /> : null}
            </PrimitivesSpecimen>
        </PrimitivesSection>
    );
}
