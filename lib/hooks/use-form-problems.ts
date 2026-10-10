import { useState } from "react";
import type { AccountField, FormProblem } from "@/lib/types";

export function useFormProblems<F extends string = AccountField>() {
    const [problems, setProblems] = useState<FormProblem<F>[]>([]);
    const [attempt, setAttempt] = useState(0);

    const fail = (found: FormProblem<F>[]) => {
        setProblems(found);
        setAttempt((count) => count + 1);
    };

    const clear = (field: F) => setProblems((current) => current.filter((problem) => problem.field !== field));
    const reset = () => setProblems([]);
    const errorFor = (field: F) => problems.find((problem) => problem.field === field)?.message;

    return { problems, attempt, fail, clear, reset, errorFor };
}
