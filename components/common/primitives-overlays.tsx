"use client";
import { useState } from "react";
import PrimitivesSection from "@/components/common/primitives-section";
import PrimitivesSpecimen from "@/components/common/primitives-specimen";
import Button from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Dialog from "@/components/ui/dialog";
import Disclosure from "@/components/ui/disclosure";
import Drawer from "@/components/ui/drawer";
import LaneLabel from "@/components/common/lane-label";
import StatusLabel from "@/components/ui/status-label";
import Toggletip from "@/components/ui/toggletip";
import Tooltip from "@/components/ui/tooltip";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { loadStatusDisplay } from "@/lib/loads/status";
import { SPECIMEN_GLOSSARY, SPECIMEN_LOADS, SPECIMEN_PENDING_MS } from "@/lib/data/primitives/samples";

const { sections, specimens, demo } = PRIMITIVES_COPY;
const [preview] = SPECIMEN_LOADS;

export default function PrimitivesOverlays() {
    const [dialog, setDialog] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [drawer, setDrawer] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const cancel = () => {
        setCancelling(true);
        setTimeout(() => {
            setCancelling(false);
            setConfirm(false);
        }, SPECIMEN_PENDING_MS);
    };

    return (
        <PrimitivesSection {...sections.overlays}>
            <PrimitivesSpecimen label={specimens.dialog} contract="IC-41">
                <Button tone="outline" onPress={() => setDialog(true)}>
                    {demo.openDialog}
                </Button>
                <Dialog
                    isOpen={dialog}
                    onOpenChange={setDialog}
                    kicker={demo.dialogKicker}
                    title={demo.dialogTitle}
                    description={demo.dialogBody}
                    footer={
                        <>
                            <Button tone="ghost" onPress={() => setDialog(false)}>
                                {demo.keepAction}
                            </Button>
                            <Button onPress={() => setDialog(false)}>{demo.save}</Button>
                        </>
                    }
                />
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.confirm} contract="IC-12">
                <Button tone="danger" onPress={() => setConfirm(true)}>
                    {demo.openConfirm}
                </Button>
                <ConfirmDialog
                    isOpen={confirm}
                    onOpenChange={setConfirm}
                    title={demo.confirmTitle}
                    consequence={demo.confirmBody}
                    confirmLabel={demo.confirmAction}
                    cancelLabel={demo.keepAction}
                    onConfirm={cancel}
                    pending={cancelling}
                    destructive
                />
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.drawer}>
                <Button tone="quiet" onPress={() => setDrawer(true)}>
                    {demo.openDrawer}
                </Button>
                <Drawer isOpen={drawer} onOpenChange={setDrawer} side="right" kicker={demo.drawerKicker} title={demo.drawerTitle}>
                    <div className="flex flex-col gap-3 text-xs">
                        <StatusLabel {...loadStatusDisplay(preview.status, preview.qualifier)} />
                        <LaneLabel origin={preview.origin} destination={preview.destination} />
                        <p className="text-text-secondary">
                            {preview.pickup.day} · {preview.pickup.time}
                        </p>
                    </div>
                </Drawer>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.tips} contract="IC-56">
                <Tooltip content={demo.download}>
                    <Button tone="ghost" size="sm">
                        {demo.ghost}
                    </Button>
                </Tooltip>
                <span className="text-text-secondary inline-flex items-center gap-1.5 text-xs">
                    {SPECIMEN_GLOSSARY.term}
                    <Toggletip term={SPECIMEN_GLOSSARY.term} definition={SPECIMEN_GLOSSARY.definition} />
                </span>
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.disclosure} contract="IC-32" wide>
                <Disclosure title={demo.disclosureTitle} kicker={demo.dialogKicker} className="w-full">
                    {demo.disclosureBody}
                </Disclosure>
            </PrimitivesSpecimen>
        </PrimitivesSection>
    );
}
