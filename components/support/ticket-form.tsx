"use client";
import type { ChangeEvent, FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import TicketContext from "@/components/support/ticket-context";
import AreaField from "@/components/common/area-field";
import BoardField from "@/components/common/board-field";
import ChoiceGrid from "@/components/common/choice-grid";
import { SUPPORT_COPY } from "@/lib/data/support/copy";
import { TICKET_LIMITS } from "@/lib/support/constants";
import type { ContextLine, TicketDraft, TicketDraftField, TicketField } from "@/lib/types";

interface Props {
    idOf: (field: TicketField) => string;
    values: TicketDraft;
    errorFor: (field: TicketField) => string | undefined;
    anonymous: boolean;
    lines: readonly ContextLine[];
    saved: boolean;
    pending: boolean;
    onSet: <K extends TicketDraftField>(field: K, value: TicketDraft[K]) => void;
    onSubmit: (event: FormEvent) => void;
}

const { fields, categories, urgencies } = SUPPORT_COPY;
const LABEL = "haulr-label text-text-muted tabular-nums";

export default function TicketForm(props: Props) {
    const { idOf, values, errorFor, anonymous, lines, saved, pending, onSet, onSubmit } = props;
    const text = (field: "subject" | "load" | "email") => (event: ChangeEvent<HTMLInputElement>) => onSet(field, event.target.value);

    return (
        <form onSubmit={onSubmit} noValidate aria-busy={pending} className="flex flex-col gap-6">
            <ChoiceGrid
                id={idOf("category")}
                name="category"
                legend={fields.category.label}
                index={fields.category.index}
                options={categories}
                value={values.category}
                columns={2}
                error={errorFor("category")}
                disabled={pending}
                onChange={(value) => onSet("category", value)}
            />
            <ChoiceGrid
                id={idOf("urgency")}
                name="urgency"
                legend={fields.urgency.label}
                index={fields.urgency.index}
                options={urgencies}
                value={values.urgency}
                error={errorFor("urgency")}
                disabled={pending}
                onChange={(value) => onSet("urgency", value)}
            />
            <BoardField
                id={idOf("subject")}
                {...fields.subject}
                maxLength={TICKET_LIMITS.subject}
                value={values.subject}
                onChange={text("subject")}
                readOnly={pending}
                error={errorFor("subject")}
            />
            <AreaField
                id={idOf("description")}
                {...fields.description}
                maxLength={TICKET_LIMITS.description}
                value={values.description}
                onChange={(event) => onSet("description", event.target.value)}
                readOnly={pending}
                error={errorFor("description")}
                aside={<span className={LABEL}>{`${values.description.length}/${TICKET_LIMITS.description}`}</span>}
            />
            <BoardField
                id={idOf("load")}
                {...fields.load}
                spellCheck={false}
                value={values.load}
                onChange={text("load")}
                readOnly={pending}
                error={errorFor("load")}
                aside={<span className={LABEL}>{SUPPORT_COPY.optional}</span>}
            />
            {anonymous ? (
                <BoardField
                    id={idOf("email")}
                    {...fields.email}
                    inputMode="email"
                    spellCheck={false}
                    value={values.email}
                    onChange={text("email")}
                    readOnly={pending}
                    error={errorFor("email")}
                />
            ) : null}
            {lines.length > 0 ? <TicketContext lines={lines} /> : null}
            <div className="flex flex-col gap-2">
                <AuthSubmit label={SUPPORT_COPY.submit} pendingLabel={SUPPORT_COPY.pending} pending={pending} />
                <p aria-live="polite" className={`${LABEL} empty:hidden`}>
                    {saved ? SUPPORT_COPY.draft : ""}
                </p>
            </div>
        </form>
    );
}
