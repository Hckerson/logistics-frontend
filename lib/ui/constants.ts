import type { ButtonSize, ButtonTone, ControlSize, CornerTone, SignalTone } from "@/lib/types";

export const UI_LOCALE = "en-US";

export const FOCUS_RING = "focus-visible:outline-text focus-visible:outline-2 focus-visible:outline-offset-2";

export const BUTTON_BASE = [
    "group relative inline-flex shrink-0 cursor-pointer items-center overflow-hidden leading-tight text-balance select-none",
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
    danger: "border-signal-danger-edge text-signal-danger hover:border-signal-danger hover:bg-signal-danger-wash border",
    link: "text-text-muted hover:text-text",
};

const CENTERED = "justify-center text-center font-medium";

export const BUTTON_SIZES: Record<ButtonSize, string> = {
    sm: `${CENTERED} min-h-7 gap-1.5 px-2.5 py-1 text-xs`,
    md: `${CENTERED} min-h-9 gap-2 px-3.5 py-1.5 text-xs`,
    lg: `${CENTERED} min-h-12 gap-2 px-6 py-2 text-base`,
    xl: `${CENTERED} min-h-14 gap-2 px-6 py-2 text-lg`,
    wide: "min-h-12 w-full justify-between gap-2 px-4 py-2 text-left text-sm font-medium",
    inline: "gap-1.5 text-xs",
};

export const SQUARE_SIZES: Record<ControlSize, string> = {
    sm: "size-7 justify-center",
    md: "size-9 justify-center",
    lg: "size-12 justify-center",
    xl: "size-14 justify-center",
};

export const ICON_SIZES: Record<ButtonSize, string> = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-4",
    xl: "size-5",
    wide: "size-4",
    inline: "size-3.5",
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
    neutral: "text-signal-neutral",
    live: "text-signal-live",
    success: "text-signal-success",
    warning: "text-signal-warning",
    danger: "text-signal-danger",
    info: "text-signal-info",
    muted: "text-signal-muted",
};

export const SIGNAL_TAGS: Record<SignalTone, string> = {
    neutral: "border-signal-neutral-edge bg-signal-neutral-wash",
    live: "border-signal-live-edge bg-signal-live-wash",
    success: "border-signal-success-edge bg-signal-success-wash",
    warning: "border-signal-warning-edge bg-signal-warning-wash",
    danger: "border-signal-danger-edge bg-signal-danger-wash",
    info: "border-signal-info-edge bg-signal-info-wash",
    muted: "border-signal-muted-edge bg-signal-muted-wash",
};

export const LABEL_TEXT = "haulr-label text-text-muted";

export const COPY_RESET_MS = 2000;
