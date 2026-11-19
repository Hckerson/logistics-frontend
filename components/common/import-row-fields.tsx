"use client";
import { useId, type ReactNode } from "react";
import DateField from "@/components/ui/date-field";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import type { FacilityOptionDto, ImportIssueDto } from "@/lib/contract/schemas";
import { IMPORT_FIELD_SPECS } from "@/lib/data/loads/import-fields";
import { IMPORT_REVIEW_COPY } from "@/lib/data/loads/import-review-copy";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import { booleanOf, dateOf, squash } from "@/lib/loads/imports";
import type { ChoiceOption, Equipment, FieldControl, ImportField, ImportValues } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    values: ImportValues;
    issues: readonly ImportIssueDto[];
    facilities: readonly FacilityOptionDto[];
    onChange: (field: ImportField, value: string) => void;
}

type Place = "pickupFacility" | "deliveryFacility";
type Day = "pickupDate" | "deliveryDate";
type Answer = "yes" | "no";

const { editor: copy } = IMPORT_REVIEW_COPY;
const EQUIPMENT: ChoiceOption<Equipment>[] = EQUIPMENT_TYPES.map((value) => ({ value, label: copy.equipment[value] }));
const HAZMAT: ChoiceOption<Answer>[] = [
    { value: "no", label: copy.hazmat.no },
    { value: "yes", label: copy.hazmat.yes },
];
const SPAN = { one: undefined, two: "sm:col-span-2", rest: "sm:col-span-2 lg:col-span-3" } as const;

const equipmentIn = (text: string) => EQUIPMENT_TYPES.find((type) => squash(type) === squash(text) || squash(copy.equipment[type]) === squash(text)) ?? null;

const answerIn = (text: string): Answer | null => {
    const answer = booleanOf(text);
    return answer === null ? null : answer ? "yes" : "no";
};

export default function ImportRowFields({ values, issues, facilities, onChange }: Props) {
    const base = useId();
    const places: ChoiceOption<string>[] = facilities.map(({ id, name, city, region }) => ({ value: id, label: name, detail: `${city}, ${region}` }));
    const errorOf = (field: ImportField) =>
        issues
            .filter((found) => found.field === field && found.severity === "error")
            .map((found) => found.message)
            .join(" ") || undefined;
    const placeIn = (text: string) =>
        facilities.find((place) => [place.id, place.name, `${place.city}${place.region}`, place.city].some((name) => squash(name) === squash(text)))?.id ?? null;
    const unmatched = (text: string) => (text.trim() ? fillTemplate(copy.unmatched, { value: text }) : undefined);

    const cell = (field: ImportField, span: keyof typeof SPAN, control: (props: FieldControl) => ReactNode, hint?: string) => (
        <div key={field} className={SPAN[span]}>
            <Field id={`${base}-${field}`} label={IMPORT_FIELD_SPECS[field].label} hint={hint} error={errorOf(field)}>
                {control}
            </Field>
        </div>
    );

    const text = (field: ImportField, span: keyof typeof SPAN = "one", unit?: string, hint?: string) =>
        cell(field, span, (control) => <Input {...control} size="sm" unit={unit} value={values[field]} onChange={(event) => onChange(field, event.target.value)} />, hint);

    const place = (field: Place) =>
        cell(field, "two", (control) => (
            <Select
                {...control}
                size="sm"
                options={places}
                value={placeIn(values[field])}
                placeholder={unmatched(values[field])}
                onChange={(id) => onChange(field, facilities.find((option) => option.id === id)?.name ?? "")}
            />
        ));

    const day = (field: Day) => cell(field, "one", (control) => <DateField {...control} size="sm" value={dateOf(values[field].trim())?.toString() ?? null} onChange={(value) => onChange(field, value ?? "")} />);

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {text("reference")}
            {text("poNumber")}
            {cell("equipment", "one", (control) => (
                <Select {...control} size="sm" options={EQUIPMENT} value={equipmentIn(values.equipment)} placeholder={unmatched(values.equipment)} onChange={(value) => onChange("equipment", copy.equipment[value])} />
            ))}
            {text("commodity")}
            {place("pickupFacility")}
            {day("pickupDate")}
            {text("pickupTime", "one", undefined, copy.timeHint)}
            {place("deliveryFacility")}
            {day("deliveryDate")}
            {text("deliveryTime", "one", undefined, copy.timeHint)}
            {text("weightLb", "one", copy.units.weight)}
            {text("pallets")}
            {text("tempMinF", "one", copy.units.temp)}
            {text("tempMaxF", "one", copy.units.temp)}
            {cell("hazmat", "one", (control) => (
                <Select {...control} size="sm" options={HAZMAT} value={answerIn(values.hazmat)} placeholder={unmatched(values.hazmat)} onChange={(value) => onChange("hazmat", copy.hazmat[value])} />
            ))}
            {text("instructions", "rest")}
        </div>
    );
}
