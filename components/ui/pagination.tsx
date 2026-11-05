"use client";
import clsx from "clsx";
import { ChevronDown, ChevronLeft, ChevronRight } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import { UI_COPY } from "@/lib/ui/copy";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

interface Shared {
    shown: number;
    total?: number;
    className?: string;
}

interface Pages extends Shared {
    mode: "pages";
    hasPrevious: boolean;
    hasNext: boolean;
    loading?: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

interface More extends Shared {
    mode: "more";
    hasMore: boolean;
    loadingMore?: boolean;
    onLoadMore: () => void;
}

type Props = Pages | More;

const summary = (shown: number, total: number | undefined) =>
    total === undefined
        ? fillTemplate(UI_COPY.showingOpen, { shown: grouped(shown) })
        : fillTemplate(UI_COPY.showing, { shown: grouped(shown), total: grouped(total) });

export default function Pagination(props: Props) {
    return (
        <nav
            aria-label={UI_COPY.pagination}
            className={clsx("flex flex-wrap items-center justify-between gap-2", props.className)}
        >
            <p className="text-text-muted text-xs tabular-nums">{summary(props.shown, props.total)}</p>
            {props.mode === "more" ? (
                props.hasMore ? (
                    <Button
                        tone="quiet"
                        size="sm"
                        icon={ChevronDown}
                        pending={props.loadingMore}
                        pendingLabel={UI_COPY.loadingMore}
                        onPress={props.onLoadMore}
                    >
                        {UI_COPY.loadMore}
                    </Button>
                ) : null
            ) : props.hasPrevious || props.hasNext ? (
                <div className="flex items-center gap-1">
                    <Button
                        tone="ghost"
                        size="sm"
                        icon={ChevronLeft}
                        isDisabled={!props.hasPrevious || props.loading}
                        onPress={props.onPrevious}
                    >
                        {UI_COPY.previous}
                    </Button>
                    <Button
                        tone="ghost"
                        size="sm"
                        trailing={ChevronRight}
                        isDisabled={!props.hasNext || props.loading}
                        onPress={props.onNext}
                    >
                        {UI_COPY.next}
                    </Button>
                </div>
            ) : null}
        </nav>
    );
}
