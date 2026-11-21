import { useCallback, useEffect, useRef, useState } from "react";
import { DRIVER_LOCATION } from "@/lib/driver/constants";
import type { LocationState, LonLat } from "@/lib/types";

const GEOLOCATION = "geolocation";

export function useDriverLocation(watch: boolean) {
    const [state, setState] = useState<LocationState>("prompt");
    const position = useRef<GeolocationCoordinates | null>(null);
    const [coords, setCoords] = useState<LonLat | null>(null);

    useEffect(() => {
        let status: PermissionStatus | null = null;
        if (!(GEOLOCATION in navigator)) {
            void Promise.resolve().then(() => setState("unsupported"));
            return;
        }
        navigator.permissions
            ?.query({ name: GEOLOCATION })
            .then((found) => {
                status = found;
                setState(found.state);
                found.onchange = () => setState(found.state);
            })
            .catch(() => undefined);
        return () => {
            if (status) status.onchange = null;
        };
    }, []);

    useEffect(() => {
        if (!watch || state !== "granted") return;
        const watcher = navigator.geolocation.watchPosition(
            (found) => {
                position.current = found.coords;
                setCoords([found.coords.longitude, found.coords.latitude]);
            },
            () => undefined,
            DRIVER_LOCATION,
        );
        return () => navigator.geolocation.clearWatch(watcher);
    }, [watch, state]);

    const request = useCallback(() => {
        navigator.geolocation.getCurrentPosition(
            (found) => {
                position.current = found.coords;
                setCoords([found.coords.longitude, found.coords.latitude]);
                setState("granted");
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) setState("denied");
            },
            DRIVER_LOCATION,
        );
    }, []);

    const where = useCallback(() => (position.current ? { latitude: position.current.latitude, longitude: position.current.longitude } : {}), []);

    return { state, request, where, coords: state === "granted" ? coords : null };
}
