import "server-only";
import { backendFetch, readJson } from "@/lib/api-server";
import { routes } from "@/lib/contract/routes";
import { POSITION_STREAM } from "@/lib/loads/constants";
import { loadPositionsEnvelopeSchema } from "@/lib/validations/freight";

const encoder = new TextEncoder();

const frame = (event: string, data: string) => encoder.encode(`event: ${event}\ndata: ${data}\n\n`);

const keepAlive = encoder.encode(`: ${POSITION_STREAM.keepAlive}\n\n`);

export const readPositions = async (loadId: string) => {
    const upstream = await backendFetch(routes.positionsForLoad(loadId));
    const parsed = upstream.ok ? loadPositionsEnvelopeSchema.safeParse(await readJson(upstream)) : null;
    return { upstream, payload: parsed?.success ? JSON.stringify(parsed.data.data) : null };
};

export const positionStream = (loadId: string, first: string, signal: AbortSignal) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let open = true;

    return new ReadableStream<Uint8Array>({
        start(controller) {
            let last = first;
            const finish = () => {
                clearTimeout(timer);
                if (open) controller.close();
                open = false;
            };
            const tick = async () => {
                const { payload } = await readPositions(loadId).catch(() => ({ payload: null }));
                if (!open) return;
                if (payload === null) {
                    controller.enqueue(frame(POSITION_STREAM.closeEvent, loadId));
                    finish();
                    return;
                }
                controller.enqueue(payload === last ? keepAlive : frame(POSITION_STREAM.event, payload));
                last = payload;
                timer = setTimeout(tick, POSITION_STREAM.pollMs);
            };

            controller.enqueue(frame(POSITION_STREAM.event, first));
            signal.addEventListener("abort", finish, { once: true });
            timer = setTimeout(tick, POSITION_STREAM.pollMs);
        },
        cancel() {
            clearTimeout(timer);
            open = false;
        },
    });
};
