"use client";
import type { ReactNode } from "react";
import { WarningFilled } from "@carbon/icons-react";
import AssignmentForm from "@/components/common/assignment-form";
import SectionState from "@/components/common/section-state";
import Dialog from "@/components/ui/dialog";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { useSession } from "@/components/providers/session-provider";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import { ASSIGNMENT_COPY } from "@/lib/data/fleet/assignment";
import { useAssignLoad, useFleetOptions } from "@/lib/hooks/use-assign-load";
import type { AssignTarget } from "@/lib/types";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    target: AssignTarget;
    preview?: ReactNode;
    onClose: () => void;
}

const copy = ASSIGNMENT_COPY;

export default function AssignmentDialog({ target, preview, onClose }: Props) {
    const options = useFleetOptions(target.loadId, true);
    const assign = useAssignLoad(target.loadId);
    const announce = useAnnounce();
    const staff = hasAnyRole(useSession()?.roles ?? [], ROLE_GROUPS.internal);
    const failure = assign.isError ? failureFrom(assign.error) : null;
    const problem = failure ? (failure.errorClass === "precondition" || failure.errorClass === "conflict" ? copy.errors[failure.errorClass] : errorMessage(failure)) : null;

    const close = (open: boolean) => {
        if (!open && !assign.isPending) onClose();
    };

    return (
        <Dialog isOpen onOpenChange={close} kicker={target.loadId} title={options.data?.reassign ? copy.reassignTitle : copy.title} dismissable={!assign.isPending}>
            {problem ? (
                <p role="alert" className="text-error flex items-start gap-1.5">
                    <WarningFilled aria-hidden className="mt-px size-3.5 shrink-0" />
                    {problem}
                </p>
            ) : null}
            <SectionState label={copy.title} query={options}>
                {(data) => (
                    <AssignmentForm
                        key={data.version}
                        options={data}
                        target={target}
                        staff={staff}
                        pending={assign.isPending}
                        preview={preview}
                        onCancel={onClose}
                        onSubmit={(input, names) =>
                            assign.mutate(input, {
                                onSuccess: () => {
                                    announce({ message: fillTemplate(copy.done, { ...names, load: target.loadId }) });
                                    onClose();
                                },
                            })
                        }
                    />
                )}
            </SectionState>
        </Dialog>
    );
}
