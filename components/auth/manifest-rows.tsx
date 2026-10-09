import clsx from "clsx";
import { Checkmark } from "@carbon/icons-react";
import { BOARD, FIELD_FLIP, QUIET_LINK } from "@/lib/auth/constants";
import { bootBase } from "@/lib/auth/entry";
import { REGISTER_COPY } from "@/lib/data/auth/register";
import type { AccountDraft, ManifestField } from "@/lib/types";

interface Props {
    fields: readonly ManifestField[];
    values: AccountDraft;
    disabled: boolean;
    onEdit: (field: ManifestField) => void;
}

const { fields: COPY, manifest } = REGISTER_COPY;

export default function ManifestRows({ fields, values, disabled, onEdit }: Props) {
    return (
        <ol className="border-border-dark flex flex-col border-y border-dashed">
            {fields.map((field) => (
                <li
                    key={field}
                    style={bootBase(FIELD_FLIP)}
                    className="haulr-part border-border-dark flex items-center gap-3 border-b border-dashed py-2.5 last:border-b-0 [--haulr-part-y:0.5rem]"
                >
                    <span className="haulr-label text-text-muted w-5 shrink-0">{COPY[field].index}</span>
                    <span className="haulr-label text-text-muted w-14 shrink-0">{manifest.labels[field]}</span>
                    <span className="text-text min-w-0 flex-1 truncate font-mono text-sm">
                        {field === "password" ? BOARD.mask.repeat(values.password.length) : values[field]}
                    </span>
                    <Checkmark aria-hidden className="text-accent size-3.5 shrink-0" />
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onEdit(field)}
                        aria-label={manifest.editLabel.replace("{field}", COPY[field].label)}
                        className={clsx(QUIET_LINK, "shrink-0 cursor-pointer disabled:opacity-40")}
                    >
                        {manifest.edit}
                    </button>
                </li>
            ))}
        </ol>
    );
}
