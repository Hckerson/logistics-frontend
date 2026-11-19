"use client";
import { useCallback, useState } from "react";
import { Search } from "@carbon/icons-react";
import QuickFindSearch from "@/components/common/quick-find-search";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import IconButton from "@/components/ui/icon-button";
import Kbd from "@/components/ui/kbd";
import { SHELL_COPY } from "@/lib/data/shell";
import { useApplePlatform, useShortcut } from "@/lib/hooks/use-shortcut";

const { quickFind: copy } = SHELL_COPY;
const SHORTCUT_KEY = "k";

export default function QuickFind() {
    const [open, setOpen] = useState(false);
    const apple = useApplePlatform();
    const show = useCallback(() => setOpen(true), []);
    useShortcut(SHORTCUT_KEY, show);

    return (
        <>
            <Button tone="outline" size="sm" icon={Search} onPress={show} className="max-sm:hidden">
                <span className="flex items-center gap-4">
                    <span className="text-text-muted">{copy.trigger}</span>
                    <Kbd keys={apple ? copy.keys.apple : copy.keys.other} announce />
                </span>
            </Button>
            <IconButton label={copy.trigger} icon={Search} size="sm" onPress={show} className="sm:hidden" />
            <Dialog isOpen={open} onOpenChange={setOpen} title={copy.title}>
                <QuickFindSearch onDone={() => setOpen(false)} />
            </Dialog>
        </>
    );
}
