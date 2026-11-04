"use client";
import { useState } from "react";
import PrimitivesLoadTable from "@/components/common/primitives-load-table";
import PrimitivesSection from "@/components/common/primitives-section";
import PrimitivesSpecimen from "@/components/common/primitives-specimen";
import FileDrop from "@/components/ui/file-drop";
import FileRow from "@/components/ui/file-row";
import { PRIMITIVES_COPY } from "@/lib/data/primitives/copy";
import { SPECIMEN_FILES } from "@/lib/data/primitives/samples";
import { DOCUMENT_CONTENT_TYPES, DOCUMENT_RULES } from "@/lib/loads/constants";
import { BYTES_PER_MEGABYTE } from "@/lib/utils/format-number";

const { sections, specimens, demo } = PRIMITIVES_COPY;

export default function PrimitivesCollections() {
    const [notes, setNotes] = useState<string[]>([]);

    return (
        <PrimitivesSection {...sections.collections}>
            <PrimitivesSpecimen label={specimens.table} contract="IC-22 · IC-21" wide>
                <PrimitivesLoadTable />
            </PrimitivesSpecimen>
            <PrimitivesSpecimen label={specimens.upload} contract="IC-24" wide>
                <div className="grid w-full gap-3 lg:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <FileDrop
                            label={demo.uploadHint}
                            accept={DOCUMENT_CONTENT_TYPES}
                            maxSizeMb={DOCUMENT_RULES.maxBytes / BYTES_PER_MEGABYTE}
                            maxFiles={DOCUMENT_RULES.maxFiles}
                            onFiles={(files) => setNotes(files.map((file) => file.name))}
                            onReject={setNotes}
                        />
                        <p role="status" className="text-text-muted text-xs">
                            {notes.join(" · ")}
                        </p>
                    </div>
                    <ul className="flex flex-col">
                        {SPECIMEN_FILES.map((file) => (
                            <FileRow key={file.name} {...file} />
                        ))}
                    </ul>
                </div>
            </PrimitivesSpecimen>
        </PrimitivesSection>
    );
}
