import type { ButtonTone, ControlSize, CornerTone, SignalTone } from "@/lib/types";

export const UI_LOCALE = "en-US";

export const FOCUS_RING = "focus-visible:outline-text focus-visible:outline-2 focus-visible:outline-offset-2";

export const BUTTON_BASE = [
    "group relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden text-center leading-tight font-medium text-balance select-none",
    "transition-[color,background-color,border-color,translate] duration-200 data-pressed:translate-y-px",
    "disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 data-pending:cursor-wait",
    FOCUS_RING,
].join(" ");

export const BUTTON_TONES: Record<ButtonTone, string> = {
    ink: "bg-text text-text-inverse hover:bg-text-secondary",
    accent: "bg-accent text-text-inverse hover:bg-accent-dark",
    outline: "border border-border-dark text-text hover:border-text",
    quiet: "bg-background-muted text-text hover:bg-border",
    ghost: "text-text-secondary hover:bg-background-muted hover:text-text",
    danger: "border border-error/50 text-error hover:border-error hover:bg-error-light",
};

export const BUTTON_SIZES: Record<ControlSize, string> = {
    sm: "min-h-7 gap-1.5 px-2.5 py-1 text-xs",
    md: "min-h-9 gap-2 px-3.5 py-1.5 text-xs",
    lg: "min-h-12 gap-2 px-6 py-2 text-base",
    xl: "min-h-14 gap-2 px-6 py-2 text-lg",
};

export const SQUARE_SIZES: Record<ControlSize, string> = {
    sm: "size-7",
    md: "size-9",
    lg: "size-12",
    xl: "size-14",
};

export const ICON_SIZES: Record<ControlSize, string> = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-4",
    xl: "size-5",
};

export const CONTROL_SIZES: Record<ControlSize, string> = {
    sm: "h-7 gap-1.5 px-2 text-xs",
    md: "h-9 gap-2 px-3 text-xs",
    lg: "h-12 gap-3 px-4 text-sm",
    xl: "h-14 gap-3 px-4 text-lg",
};

export const FIELD_FRAME =
    "group/control text-text relative flex w-full min-w-0 items-center border-b transition-colors has-disabled:opacity-40";

export const FIELD_STATES = {
    idle: "bg-background-muted border-border-dark hover:border-text-muted focus-within:border-text-muted",
    invalid: "bg-error-light border-error",
} as const;

export const FIELD_INPUT =
    "h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-muted read-only:text-text-secondary disabled:cursor-not-allowed autofill:shadow-[inset_0_0_0_100vmax_var(--colors-background-muted)] autofill:[-webkit-text-fill-color:var(--colors-text)]";

export const FOCUS_CORNERS = {
    motion: "transition-[opacity,scale] duration-300 ease-out group-focus-within/control:scale-100 group-focus-within/control:opacity-100",
    shown: "scale-100 opacity-100",
    hidden: "scale-150 opacity-0",
} as const;

export const CORNER_TONES: Record<CornerTone, string> = {
    muted: "border-text-muted",
    accent: "border-accent",
    error: "border-error",
};

export const OVERLAY_SURFACE =
    "border-border/70 bg-background/95 relative border shadow-xl outline-none backdrop-blur-sm data-entering:haulr-drop data-exiting:haulr-fade-out";

export const OVERLAY_BACKDROP =
    "bg-overlay fixed inset-0 z-(--z-indices-modal) backdrop-blur-[2px] data-entering:haulr-fade-in data-exiting:haulr-fade-out";

export const TOOLTIP_DELAY = { open: 500, close: 150 } as const;

export const OVERLAY_HEADER = "haulr-label border-border text-text-muted flex items-center justify-between gap-3 border-b px-3 py-2";

export const ITEM_ROW = [
    "group/item text-text-secondary relative flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs outline-none",
    "data-focused:bg-background-muted data-focused:text-text data-selected:text-text",
    "data-disabled:text-text-muted data-disabled:cursor-not-allowed",
].join(" ");

export const ITEM_RULE = "bg-accent absolute inset-y-1.5 left-0 w-0.5";

export const ITEM_SIGNAL = `${ITEM_RULE} scale-y-0 transition-transform duration-200 group-data-focused/item:scale-y-100`;

export const SIGNAL_TONES: Record<SignalTone, string> = {
    neutral: "text-text-secondary",
    live: "text-accent",
    success: "text-success",
    warning: "text-warning",
    danger: "text-error",
    info: "text-info",
    muted: "text-text-muted",
};

export const LABEL_TEXT = "haulr-label text-text-muted";

export const UI_COPY = {
    clear: "Clear",
    close: "Close",
    cancel: "Cancel",
    more: "More actions",
    loading: "Loading",
    noResults: "No matches. Try a different spelling.",
    explain: "What does {term} mean?",
    sortAscending: "Sorted by {column}, ascending",
    sortDescending: "Sorted by {column}, descending",
    showing: "Showing {shown} of {total}",
    showingOpen: "Showing {shown}",
    previous: "Previous page",
    next: "Next page",
    loadMore: "Load more",
    loadingMore: "Loading more…",
    pagination: "Pagination",
    dropFiles: "Drop files here or",
    chooseFiles: "choose files",
    fileLimits: "PDF, JPG or PNG, up to {size} MB each, up to {count} files",
    fileLimitOne: "PDF, JPG or PNG, up to {size} MB",
    fileProgress: "{percent} percent, {name}",
    fileStates: { uploading: "Uploading", scanning: "Scanning", uploaded: "Uploaded", rejected: "Rejected", failed: "Upload failed" },
    fileType: "{name} is not a PDF, JPG or PNG.",
    fileSize: "{name} is larger than {size} MB.",
    fileCount: "Choose up to {count} files at a time.",
    remove: "Remove {name}",
    retry: "Retry",
    expired: "Expired",
    timeLeft: "{time} left",
    chooseDate: "Choose date",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    tabCount: "{label}, {count}",
    durations: {
        hour: { one: "{count} hour", other: "{count} hours" },
        minute: { one: "{count} minute", other: "{count} minutes" },
        second: { one: "{count} second", other: "{count} seconds" },
    },
} as const;
