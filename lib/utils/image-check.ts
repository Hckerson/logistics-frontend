import { POD_IMAGE } from "@/lib/driver/constants";

type Rejection = "type" | "small" | "dark" | "blurry";

export type ImageCheck = { ok: true; blob: Blob } | { ok: false; reason: Rejection };

const LUMA = [0.299, 0.587, 0.114] as const;
const CHANNELS = 4;
const MAX_CHANNEL = 255;

const canvasOf = (width: number, height: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    return canvas;
};

const grayscale = (bitmap: ImageBitmap) => {
    const scale = POD_IMAGE.sampleWidth / bitmap.width;
    const canvas = canvasOf(POD_IMAGE.sampleWidth, bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
    const gray = new Float32Array(width * height);
    for (let pixel = 0; pixel < gray.length; pixel++) {
        const offset = pixel * CHANNELS;
        gray[pixel] = LUMA[0] * data[offset] + LUMA[1] * data[offset + 1] + LUMA[2] * data[offset + 2];
    }
    return { gray, width, height };
};

const sharpness = ({ gray, width, height }: { gray: Float32Array; width: number; height: number }) => {
    const values: number[] = [];
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const at = y * width + x;
            values.push(gray[at - 1] + gray[at + 1] + gray[at - width] + gray[at + width] - 4 * gray[at]);
        }
    }
    const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
    return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, values.length);
};

const encode = (bitmap: ImageBitmap) =>
    new Promise<Blob | null>((resolve) => {
        const scale = Math.min(1, POD_IMAGE.maxLongSide / Math.max(bitmap.width, bitmap.height));
        const canvas = canvasOf(bitmap.width * scale, bitmap.height * scale);
        canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, POD_IMAGE.outputType, POD_IMAGE.jpegQuality);
    });

export const checkImage = async (file: File): Promise<ImageCheck> => {
    if (!POD_IMAGE.types.some((type) => type === file.type)) return { ok: false, reason: "type" };
    const bitmap = await createImageBitmap(file);
    if (Math.min(bitmap.width, bitmap.height) < POD_IMAGE.minShortSide) return { ok: false, reason: "small" };

    const sample = grayscale(bitmap);
    if (sample) {
        const luminance = sample.gray.reduce((sum, value) => sum + value, 0) / sample.gray.length / MAX_CHANNEL;
        if (luminance < POD_IMAGE.darkLuminance) return { ok: false, reason: "dark" };
        if (sharpness(sample) < POD_IMAGE.blurVariance) return { ok: false, reason: "blurry" };
    }

    const blob = await encode(bitmap);
    bitmap.close();
    return blob ? { ok: true, blob } : { ok: false, reason: "type" };
};
