import { formOptions } from "@tanstack/react-form";
import { blankDraft } from "@/lib/loads/posting";
import { freightEntriesSchema, laneEntriesSchema } from "@/lib/validations/posting";

const BLANK = blankDraft();

export const laneFormOptions = formOptions({
    defaultValues: BLANK.lane,
    validators: { onChange: laneEntriesSchema, onSubmit: laneEntriesSchema },
});

export const freightFormOptions = formOptions({
    defaultValues: BLANK.freight,
    validators: { onChange: freightEntriesSchema, onSubmit: freightEntriesSchema },
});
