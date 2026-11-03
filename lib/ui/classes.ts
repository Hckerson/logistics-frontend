import clsx from "clsx";
import { BUTTON_BASE, BUTTON_SIZES, BUTTON_TONES, CONTROL_SIZES, FIELD_FRAME, FIELD_STATES, SQUARE_SIZES } from "@/lib/ui/constants";
import type { ButtonTone, ControlSize } from "@/lib/types";

export const buttonClass = (tone: ButtonTone = "ink", size: ControlSize = "md", className?: string) =>
    clsx(BUTTON_BASE, BUTTON_TONES[tone], BUTTON_SIZES[size], className);

export const squareButtonClass = (tone: ButtonTone = "ghost", size: ControlSize = "md", className?: string) =>
    clsx(BUTTON_BASE, BUTTON_TONES[tone], SQUARE_SIZES[size], className);

export const fieldClass = (size: ControlSize = "md", invalid = false, className?: string) =>
    clsx(FIELD_FRAME, CONTROL_SIZES[size], invalid ? FIELD_STATES.invalid : FIELD_STATES.idle, className);

export const describedBy = (...ids: (string | false | null | undefined)[]) => clsx(ids) || undefined;
