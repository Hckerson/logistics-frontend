"use client";
import { useStore } from "@tanstack/react-form";
import { useAnnounce } from "@/components/providers/announcer-provider";
import Checkbox from "@/components/ui/checkbox";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import RadioGroup from "@/components/ui/radio-group";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { FREIGHT_COPY } from "@/lib/data/loads/post-freight-copy";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { withForm } from "@/lib/hooks/use-app-form";
import { freightFormOptions } from "@/lib/loads/post-forms";
import { codeOf, freightFieldId, freightMessage } from "@/lib/loads/post-problems";
import { POSTING, REQUIREMENTS } from "@/lib/loads/posting";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";
import type { Equipment } from "@/lib/types";

type TextField = "commodity" | "weightLb" | "pallets" | "tempMinF" | "tempMaxF" | "unNumber" | "poNumber";

interface Meta {
    errors: readonly unknown[];
    isBlurred: boolean;
}

const EQUIPMENT = EQUIPMENT_TYPES.map((value) => ({ value, label: LOAD_COPY.equipment[value], detail: FREIGHT_COPY.equipmentDetail[value] }));

const TEXT: Record<TextField, { label: string; hint?: string; unit?: string; numeric?: boolean; max?: number }> = {
    commodity: { label: FREIGHT_COPY.commodity, hint: FREIGHT_COPY.commodityHint, max: POSTING.commodity },
    weightLb: { label: FREIGHT_COPY.weight, hint: fillTemplate(FREIGHT_COPY.weightHint, { max: grouped(POSTING.weightLb) }), unit: FREIGHT_COPY.unit.weight, numeric: true },
    pallets: { label: FREIGHT_COPY.pallets, hint: FREIGHT_COPY.palletsHint, numeric: true },
    tempMinF: { label: FREIGHT_COPY.tempMin, unit: FREIGHT_COPY.unit.temp, numeric: true },
    tempMaxF: { label: FREIGHT_COPY.tempMax, unit: FREIGHT_COPY.unit.temp, numeric: true },
    unNumber: { label: FREIGHT_COPY.unNumber, hint: FREIGHT_COPY.unHint, max: 6 },
    poNumber: { label: FREIGHT_COPY.poNumber, hint: FREIGHT_COPY.poHint, max: POSTING.poNumber },
};

const PostFreightFields = withForm({
    ...freightFormOptions,
    render: function Render({ form }) {
        const announce = useAnnounce();
        const attempted = useStore(form.store, (state) => state.submissionAttempts > 0);
        const equipment = useStore(form.store, (state) => state.values.equipment);
        const hazmat = useStore(form.store, (state) => state.values.hazmat);
        const errorOf = (field: TextField | "equipment", meta: Meta) => {
            const code = attempted || meta.isBlurred ? codeOf(meta.errors) : null;
            return code ? (freightMessage(field, code) ?? undefined) : undefined;
        };

        const text = (name: TextField) => (
            <form.Field name={name}>
                {(field) => (
                    <Field id={freightFieldId(name)} label={TEXT[name].label} hint={TEXT[name].hint} error={errorOf(name, field.state.meta)}>
                        {(control) => (
                            <Input
                                {...control}
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                                onBlur={field.handleBlur}
                                unit={TEXT[name].unit}
                                inputMode={TEXT[name].numeric ? "decimal" : undefined}
                                maxLength={TEXT[name].max}
                                className={TEXT[name].numeric ? "font-mono tabular-nums" : undefined}
                            />
                        )}
                    </Field>
                )}
            </form.Field>
        );

        return (
            <div className="flex flex-col gap-4">
                <form.Field name="equipment">
                    {(field) => (
                        <RadioGroup<Equipment>
                            id={freightFieldId("equipment")}
                            legend={FREIGHT_COPY.equipment}
                            options={EQUIPMENT}
                            columns={3}
                            value={field.state.value}
                            error={errorOf("equipment", field.state.meta)}
                            onChange={(value) => {
                                field.handleChange(value);
                                field.handleBlur();
                                if (value === "reefer") announce({ message: FREIGHT_COPY.tempShown });
                            }}
                        />
                    )}
                </form.Field>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {text("commodity")}
                    {text("weightLb")}
                    {text("pallets")}
                </div>
                {equipment === "reefer" ? (
                    <div role="group" aria-label={FREIGHT_COPY.tempLegend} className="border-border grid gap-4 border-l-2 pl-4 sm:grid-cols-2">
                        {text("tempMinF")}
                        {text("tempMaxF")}
                    </div>
                ) : null}
                <form.Field name="hazmat">
                    {(field) => (
                        <div className="flex flex-col gap-1">
                            <Checkbox
                                isSelected={field.state.value}
                                onChange={(selected) => {
                                    field.handleChange(selected);
                                    if (selected) announce({ message: FREIGHT_COPY.unShown });
                                }}
                            >
                                {FREIGHT_COPY.hazmat}
                            </Checkbox>
                            <p className="text-text-muted pl-6 text-xs">{FREIGHT_COPY.hazmatDetail}</p>
                        </div>
                    )}
                </form.Field>
                {hazmat ? <div className="border-border border-l-2 pl-4 sm:max-w-xs">{text("unNumber")}</div> : null}
                <form.Field name="requirements">
                    {(field) => (
                        <div role="group" aria-label={FREIGHT_COPY.requirements} className="flex flex-col gap-2">
                            <p className="haulr-label text-text-muted">{FREIGHT_COPY.requirements}</p>
                            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                                {REQUIREMENTS.map((requirement) => (
                                    <Checkbox
                                        key={requirement}
                                        isSelected={field.state.value.includes(requirement)}
                                        onChange={(selected) => field.handleChange((current) => (selected ? [...current, requirement] : current.filter((item) => item !== requirement)))}
                                    >
                                        <span className="flex flex-col">
                                            <span>{FREIGHT_COPY.requirementOptions[requirement].label}</span>
                                            <span className="text-text-muted text-xs">{FREIGHT_COPY.requirementOptions[requirement].detail}</span>
                                        </span>
                                    </Checkbox>
                                ))}
                            </div>
                        </div>
                    )}
                </form.Field>
                <div className="sm:max-w-xs">{text("poNumber")}</div>
            </div>
        );
    },
});

export default PostFreightFields;
