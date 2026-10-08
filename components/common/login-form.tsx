"use client";
import { useId } from "react";
import { ArrowRight, CircleDash } from "@carbon/icons-react";
import ErrorSummary from "@/components/common/error-summary";
import FormField, { fieldErrorId } from "@/components/common/form-field";
import PasswordInput from "@/components/common/password-input";
import { haulrButtonClass } from "@/components/home/haulr-button";
import Input from "@/components/ui/input";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";
import { problemCount } from "@/lib/auth/sign-in";
import { useSignInForm } from "@/lib/hooks/use-sign-in-form";
import type { SignInField } from "@/lib/types";

interface Props {
    next: string;
}

const { fields, summary } = SIGN_IN_COPY;

export default function LoginForm({ next }: Props) {
    const form = useSignInForm(next);
    const baseId = useId();
    const idOf = (field: SignInField) => `${baseId}-${field}`;
    const describe = (field: SignInField) => (form.errorFor(field) ? fieldErrorId(idOf(field)) : undefined);

    return (
        <div className="flex flex-col gap-4">
            <ErrorSummary
                problems={form.problems}
                attempt={form.attempt}
                heading={summary.heading}
                count={problemCount(form.problems.length)}
                fieldId={idOf}
            />
            <form onSubmit={form.submit} noValidate aria-busy={form.pending} className="flex flex-col gap-4">
                <FormField id={idOf("email")} label={fields.email.label} error={form.errorFor("email")}>
                    <Input
                        id={idOf("email")}
                        name={fields.email.name}
                        type={fields.email.type}
                        inputMode="email"
                        autoComplete={fields.email.autoComplete}
                        spellCheck={false}
                        value={form.values.email}
                        onChange={form.update("email")}
                        readOnly={form.pending}
                        invalid={Boolean(form.errorFor("email"))}
                        aria-describedby={describe("email")}
                    />
                </FormField>
                <FormField id={idOf("password")} label={fields.password.label} error={form.errorFor("password")}>
                    <PasswordInput
                        id={idOf("password")}
                        name={fields.password.name}
                        autoComplete={fields.password.autoComplete}
                        value={form.values.password}
                        onChange={form.update("password")}
                        readOnly={form.pending}
                        invalid={Boolean(form.errorFor("password"))}
                        aria-describedby={describe("password")}
                        revealLabel={SIGN_IN_COPY.reveal}
                    />
                </FormField>
                <button
                    type="submit"
                    aria-disabled={form.pending}
                    className={haulrButtonClass("accent", "lg", "mt-2 w-full cursor-pointer aria-disabled:cursor-wait")}
                >
                    {form.pending ? (
                        <>
                            <CircleDash aria-hidden className="size-4 animate-spin" />
                            {SIGN_IN_COPY.pending}
                        </>
                    ) : (
                        <>
                            {SIGN_IN_COPY.submit}
                            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
