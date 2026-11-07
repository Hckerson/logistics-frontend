import { useEffect, useSyncExternalStore } from "react";

const TEXT_ENTRY = "input, textarea, select, [contenteditable='true']";
const APPLE = /Mac|iPhone|iPad/;

const never = () => () => undefined;

export function useShortcut(key: string, onPress: () => void) {
    useEffect(() => {
        const listen = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== key || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
            if (event.target instanceof Element && event.target.closest(TEXT_ENTRY)) return;
            event.preventDefault();
            onPress();
        };
        window.addEventListener("keydown", listen);
        return () => window.removeEventListener("keydown", listen);
    }, [key, onPress]);
}

export const useApplePlatform = () =>
    useSyncExternalStore(
        never,
        () => APPLE.test(navigator.userAgent),
        () => false,
    );
