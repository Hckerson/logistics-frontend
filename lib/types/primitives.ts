import type { LoadStatus } from "./enums";
import type { LoadQualifier } from "./loads";
import type { FileUploadState, SignalTone } from "./ui";

export interface SpecimenLoad {
    reference: string;
    origin: string;
    destination: string;
    originCode: string;
    destinationCode: string;
    carrier: string;
    progress: number;
    status: LoadStatus;
    qualifier?: LoadQualifier;
    pickup: { day: string; time: string };
    miles: number;
    rate: number;
}

export interface SpecimenSignal {
    status: LoadStatus;
    qualifier?: LoadQualifier;
}

export interface SpecimenSwatch {
    tone: SignalTone;
    word: string;
    edge: string;
    wash: string;
}

export interface SpecimenFile {
    name: string;
    sizeBytes: number;
    state: FileUploadState;
    progress?: number;
    message?: string;
}
