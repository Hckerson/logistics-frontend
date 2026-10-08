import { useState } from "react";
import type { AccountField, FormProblem } from "@/lib/types";

export function useFormProblems() {
    const [problems, setProblems] = useState<FormProblem[]>([]);
    const [attempt, setAttempt] = useState(0);

    const fail = (found: FormProblem[]) => {
        setProblems(found);
        setAttempt((count) => count + 1);
    };

    const clear = (field: AccountField) => setProblems((current) => current.filter((problem) => problem.field !== field));
    const reset = () => setProblems([]);
    const errorFor = (field: AccountField) => problems.find((problem) => problem.field === field)?.message;

    return { problems, attempt, fail, clear, reset, errorFor };
}
