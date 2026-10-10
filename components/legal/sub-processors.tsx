import { LEGAL_COPY } from "@/lib/data/legal/copy";
import type { SubProcessor } from "@/lib/types";

interface Props {
    providers: readonly SubProcessor[];
}

const { providers: copy } = LEGAL_COPY;
const COLUMNS = ["name", "purpose", "data", "location"] as const;

export default function SubProcessors({ providers }: Props) {
    return (
        <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
                <caption className="sr-only">{copy.caption}</caption>
                <thead>
                    <tr className="border-border-dark border-b">
                        {COLUMNS.map((column) => (
                            <th key={column} scope="col" className="haulr-label text-text-muted pr-4 pb-3 font-normal">
                                {copy.columns[column]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {providers.map((provider) => (
                        <tr key={provider.name} className="border-border border-b">
                            {COLUMNS.map((column) => (
                                <td
                                    key={column}
                                    className={column === "name" ? "text-text py-3 pr-4" : "text-text-secondary py-3 pr-4"}
                                >
                                    {provider[column]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
