import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { accountProblems, registerFailure } from "@/lib/auth/register";
import { flowSignal } from "@/lib/auth/signal";
import { VERIFY_ROUTE } from "@/lib/constants";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { useManifest } from "@/lib/hooks/use-manifest";
import { useRegister } from "@/lib/hooks/use-register";
import type { AccountDraft, AccountField, AccountSide, RegisterStep } from "@/lib/types";

const DETAILS: readonly AccountField[] = ["fullName", "email", "password", "consent"];

export function useRegisterFlow(preselected: AccountSide | null) {
    const router = useRouter();
    const register = useRegister();
    const checks = useFormProblems();
    const manifest = useManifest();
    const [step, setStep] = useState<RegisterStep>(preselected ? "details" : "side");
    const [returned, setReturned] = useState(false);
    const [advanced, setAdvanced] = useState(false);
    const [created, setCreated] = useState(false);
    const [values, setValues] = useState<AccountDraft>({
        side: preselected,
        fullName: "",
        email: "",
        password: "",
        consent: false,
    });

    const choose = (side: AccountSide) => {
        setValues((current) => ({ ...current, side }));
        checks.clear("side");
    };

    const update = (field: Exclude<AccountField, "side">) => (event: ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setValues((current) => ({ ...current, [field]: field === "consent" ? checked : value }));
        checks.clear(field);
    };

    const proceed = (event: FormEvent) => {
        event.preventDefault();
        const issues = accountProblems(values, ["side"]);
        if (issues.length > 0) return checks.fail(issues);
        checks.reset();
        setAdvanced(true);
        setStep("details");
    };

    const back = () => {
        checks.reset();
        setReturned(true);
        setStep("side");
    };

    const create = () => {
        const account = { fullName: values.fullName.trim(), email: values.email.trim(), password: values.password };
        register.mutate(account, {
            onSuccess: () => {
                setCreated(true);
                router.push(VERIFY_ROUTE);
                router.refresh();
            },
            onError: (error) => {
                const problem = registerFailure(error);
                setValues((current) => ({ ...current, password: "" }));
                if (problem.field === "email") manifest.edit(problem.field);
                checks.fail([problem]);
            },
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (register.isPending || created) return;
        const issues = accountProblems(values, manifest.last ? DETAILS : [manifest.field]);
        if (issues.length > 0) return checks.fail(issues);
        checks.reset();
        if (manifest.last) return create();
        manifest.advance();
    };

    const signal = flowSignal({
        done: created,
        pending: register.isPending,
        first: step === "side",
        held: checks.problems.length > 0,
    });

    return {
        ...checks,
        step,
        returned,
        advanced,
        values,
        manifest,
        choose,
        update,
        proceed,
        back,
        submit,
        pending: register.isPending,
        created,
        signal,
    };
}
