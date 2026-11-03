import type { FileUploadState, SignalTone } from "@/lib/types/ui";

export interface SpecimenLoad {
    reference: string;
    lane: string;
    status: string;
    tone: SignalTone;
    pickup: string;
    miles: number;
    rate: number;
}

export interface SpecimenSignal {
    label: string;
    tone: SignalTone;
    pulse?: boolean;
}

export interface SpecimenFile {
    name: string;
    sizeBytes: number;
    state: FileUploadState;
    progress?: number;
    message?: string;
}
