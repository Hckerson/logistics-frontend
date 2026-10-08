import { useState, type KeyboardEvent } from "react";

export function useCapsLock() {
    const [on, setOn] = useState(false);
    const track = (event: KeyboardEvent<HTMLInputElement>) => setOn(event.getModifierState("CapsLock"));

    return { on, track, clear: () => setOn(false) };
}
