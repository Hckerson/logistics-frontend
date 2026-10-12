import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { count, perMileRate, shortDay } from "@/lib/quotes/format";
import type { TrendPoint } from "@/lib/types";

interface Props {
    points: readonly TrendPoint[];
}

const { trend } = ESTIMATOR_COPY;

export default function TrendTable({ points }: Props) {
    return (
        <details className="text-sm">
            <summary className="text-text-muted hover:text-text cursor-pointer text-xs transition-colors">{trend.table}</summary>
            <div className="mt-3 max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                    <caption className="sr-only">{trend.caption}</caption>
                    <thead>
                        <tr className="border-border-dark border-b">
                            <th scope="col" className="haulr-label text-text-muted pb-2 font-normal">
                                {trend.columns.date}
                            </th>
                            <th scope="col" className="haulr-label text-text-muted pb-2 text-right font-normal">
                                {trend.columns.rate}
                            </th>
                            <th scope="col" className="haulr-label text-text-muted pb-2 text-right font-normal">
                                {trend.columns.samples}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="font-mono tabular-nums">
                        {points.map((point) => (
                            <tr key={point.date} className="border-border border-b">
                                <td className="text-text-secondary py-1.5">{shortDay(point.date)}</td>
                                <td className="text-text py-1.5 text-right">{perMileRate(point.perMile)}</td>
                                <td className="text-text-secondary py-1.5 text-right">{count(point.samples)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </details>
    );
}
