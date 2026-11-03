import { UI_COPY } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";
import { BYTES_PER_MEGABYTE } from "@/lib/utils/format-number";

interface FileRules {
    accept: readonly string[];
    maxSizeMb: number;
    maxFiles: number;
}

const problemOf = (file: File, rules: FileRules) => {
    if (!rules.accept.includes(file.type)) return fillTemplate(UI_COPY.fileType, { name: file.name });
    if (file.size > rules.maxSizeMb * BYTES_PER_MEGABYTE)
        return fillTemplate(UI_COPY.fileSize, { name: file.name, size: String(rules.maxSizeMb) });
    return null;
};

export const checkFiles = (files: readonly File[], rules: FileRules) => {
    if (files.length > rules.maxFiles)
        return { accepted: [], rejected: [fillTemplate(UI_COPY.fileCount, { count: String(rules.maxFiles) })] };

    const checked = files.map((file) => ({ file, problem: problemOf(file, rules) }));

    return {
        accepted: checked.flatMap(({ file, problem }) => (problem === null ? [file] : [])),
        rejected: checked.flatMap(({ problem }) => (problem === null ? [] : [problem])),
    };
};
