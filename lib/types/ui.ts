import type { ReactNode } from "react";
import type { CarbonIconType } from "@carbon/icons-react";

export type ControlSize = "sm" | "md" | "lg" | "xl";

export type ButtonTone = "ink" | "accent" | "outline" | "quiet" | "ghost" | "danger";

export type SignalTone = "neutral" | "live" | "success" | "warning" | "danger" | "info" | "muted";

export type CornerTone = "muted" | "accent" | "error";

export type IconGlyph = CarbonIconType;

export interface ChoiceOption<T extends string> {
    value: T;
    label: string;
    detail?: string;
    disabledReason?: string;
}

export interface MenuEntry {
    id: string;
    label: string;
    icon?: IconGlyph;
    href?: string;
    destructive?: boolean;
    disabledReason?: string;
}

export interface TabItem {
    id: string;
    label: string;
    count?: number;
    disabledReason?: string;
}

export interface TableColumn<Row> {
    key: string;
    label: string;
    sortable?: boolean;
    align?: "start" | "end";
    rowHeader?: boolean;
    width?: string;
    cell: (row: Row) => ReactNode;
}

export interface TableSort {
    column: string;
    direction: "ascending" | "descending";
}

export type FileUploadState = "uploading" | "scanning" | "uploaded" | "rejected" | "failed";

export interface FieldControl {
    id: string;
    invalid: boolean;
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
    "aria-labelledby": string;
}
