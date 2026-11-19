import clsx from "clsx";
import Disclosure from "@/components/ui/disclosure";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { IMPORT_FIELD_SPECS } from "@/lib/data/loads/import-fields";
import { IMPORT_FIELDS, IMPORT_REQUIRED } from "@/lib/loads/imports";
import { TABLE_HEAD } from "@/lib/ui/constants";

const { dictionary: copy } = IMPORT_COPY;
const CELL = "px-3 py-2 align-top first:pl-0 last:pr-0";
const HEADINGS = [copy.field, copy.required, copy.description, copy.example];

export default function ImportDictionary() {
    return (
        <Disclosure title={copy.title} level={3}>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-xs">
                    <caption className="sr-only">{copy.caption}</caption>
                    <thead>
                        <tr className="border-border border-b">
                            {HEADINGS.map((heading) => (
                                <th key={heading} scope="col" className={clsx(TABLE_HEAD, "first:pl-0 last:pr-0")}>
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                        {IMPORT_FIELDS.map((field) => {
                            const spec = IMPORT_FIELD_SPECS[field];
                            const required = IMPORT_REQUIRED.includes(field);
                            return (
                                <tr key={field} className="border-border-light border-b last:border-b-0">
                                    <th scope="row" className={clsx(CELL, "text-text font-normal whitespace-nowrap")}>
                                        {spec.label}
                                    </th>
                                    <td className={clsx(CELL, required ? "text-text" : "text-text-muted")}>{required ? copy.yes : copy.no}</td>
                                    <td className={CELL}>{spec.description}</td>
                                    <td className={clsx(CELL, "font-mono whitespace-nowrap")}>{spec.example}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Disclosure>
    );
}
