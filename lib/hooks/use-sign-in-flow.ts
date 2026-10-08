import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { failureProblem, signInProblems } from "@/lib/auth/sign-in";
import { flowSignal } from "@/lib/auth/signal";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { useLogin } from "@/lib/hooks/use-login";
import type { Credentials, SignInField, SignInStep } from "@/lib/types";

export function useSignInFlow(next: string) {
    const router = useRouter();
    const login = useLogin();
    const checks = useFormProblems();
    const [step, setStep] = useState<SignInStep>("email");
    const [returned, setReturned] = useState(false);
    const [values, setValues] = useState<Credentials>({ email: "", password: "" });
    const [arrived, setArrived] = useState(false);

    const issuesFor = (field: SignInField) => signInProblems(values).filter((problem) => problem.field === field);

    const update = (field: SignInField) => (event: ChangeEvent<HTMLInputElement>) => {
        setValues((current) => ({ ...current, [field]: event.target.value }));
        checks.clear(field);
    };

    const proceed = (event: FormEvent) => {
        event.preventDefault();
        const issues = issuesFor("email");
        if (issues.length > 0) return checks.fail(issues);
        checks.reset();
        setStep("password");
    };

    const back = () => {
        checks.reset();
        setValues((current) => ({ ...current, password: "" }));
        setReturned(true);
        setStep("email");
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (login.isPending || arrived) return;
        const issues = issuesFor("password");
        if (issues.length > 0) return checks.fail(issues);
        checks.reset();
        login.mutate(values, {
            onSuccess: () => {
                setArrived(true);
                router.push(next);
                router.refresh();
            },
            onError: (error) => {
                setValues((current) => ({ ...current, password: "" }));
                checks.fail([failureProblem(error)]);
            },
        });
    };

    const signal = flowSignal({
        done: arrived,
        pending: login.isPending,
        first: step === "email",
        held: checks.problems.length > 0,
    });

    return { ...checks, step, returned, values, update, proceed, back, submit, pending: login.isPending, arrived, signal };
}
