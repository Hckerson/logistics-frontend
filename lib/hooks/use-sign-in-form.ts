import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { failureProblem, signInProblems } from "@/lib/auth/sign-in";
import { useLogin } from "@/lib/hooks/use-login";
import type { Credentials, FormProblem, SignInField } from "@/lib/types";

export function useSignInForm(next: string) {
    const router = useRouter();
    const login = useLogin();
    const [values, setValues] = useState<Credentials>({ email: "", password: "" });
    const [problems, setProblems] = useState<FormProblem[]>([]);
    const [attempt, setAttempt] = useState(0);

    const fail = (found: FormProblem[]) => {
        setProblems(found);
        setAttempt((count) => count + 1);
    };

    const update = (field: SignInField) => (event: ChangeEvent<HTMLInputElement>) =>
        setValues((current) => ({ ...current, [field]: event.target.value }));

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (login.isPending) return;
        const found = signInProblems(values);
        if (found.length > 0) return fail(found);
        setProblems([]);
        login.mutate(values, {
            onSuccess: () => {
                router.push(next);
                router.refresh();
            },
            onError: (error) => {
                setValues((current) => ({ ...current, password: "" }));
                fail([failureProblem(error)]);
            },
        });
    };

    const errorFor = (field: SignInField) => problems.find((problem) => problem.field === field)?.message;

    return { values, update, submit, problems, attempt, errorFor, pending: login.isPending };
}
