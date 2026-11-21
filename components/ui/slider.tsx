"use client";
import clsx from "clsx";
import { Slider as AriaSlider, SliderThumb, SliderTrack } from "react-aria-components";

interface Props {
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
    format?: Intl.NumberFormatOptions;
    isDisabled?: boolean;
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
}

export default function Slider({ min, max, step, value, onChange, format, isDisabled, className, ...aria }: Props) {
    return (
        <AriaSlider
            {...aria}
            minValue={min}
            maxValue={max}
            step={step}
            value={value}
            onChange={onChange}
            formatOptions={format}
            isDisabled={isDisabled}
            className={clsx("flex w-full touch-none data-disabled:opacity-40", className)}
        >
            <SliderTrack className="relative h-11 w-full cursor-pointer data-disabled:cursor-not-allowed">
                {({ state }) => (
                    <>
                        <span aria-hidden className="bg-border-dark absolute inset-x-0 top-1/2 h-px -translate-y-1/2" />
                        <span aria-hidden className="bg-accent absolute top-1/2 left-0 h-0.5 -translate-y-1/2" style={{ width: `${state.getThumbPercent(0) * 100}%` }} />
                        <SliderThumb
                            className={({ isFocusVisible, isDragging }) =>
                                clsx(
                                    "bg-text border-background top-1/2 size-4 rounded-full border-2 transition-transform",
                                    isDragging && "scale-125",
                                    isFocusVisible && "outline-text outline-2 outline-offset-2",
                                )
                            }
                        />
                    </>
                )}
            </SliderTrack>
        </AriaSlider>
    );
}
