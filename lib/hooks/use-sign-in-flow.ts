import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { failureProblem, signInProblems } from "@/lib/auth/sign-in";
import { flowSignal } from "@/lib/auth/signal";
import { HTTP_STATUS, mfaRoute } from "@/lib/constants";
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
    const [handedOff, setHandedOff] = useState(false);
    const pending = login.isPending || handedOff;

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
        if (pending || arrived) return;
        const issues = issuesFor("password");
        if (issues.length > 0) return checks.fail(issues);
        checks.reset();
        login.mutate(values, {
            onSuccess: (response) => {
                if (response.status === HTTP_STATUS.accepted) {
                    setHandedOff(true);
                    return router.push(mfaRoute(next));
                }
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
        pending,
        first: step === "email",
        held: checks.problems.length > 0,
    });

    return { ...checks, step, returned, values, update, proceed, back, submit, pending, arrived, signal };
}
