"use client";
import { useEffect, useState } from "react";
import ErrorSummary from "@/components/common/error-summary";
import PostFreightFields from "@/components/common/post-freight-fields";
import PostStepFrame from "@/components/common/post-step-frame";
import { POST_COPY } from "@/lib/data/loads/post-copy";
import { FREIGHT_COPY } from "@/lib/data/loads/post-freight-copy";
import { useAppForm } from "@/lib/hooks/use-app-form";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import type { PostFlow } from "@/lib/hooks/use-post-flow";
import { saveFailureText } from "@/lib/loads/post-failures";
import { freightFormOptions } from "@/lib/loads/post-forms";
import { freightProblems } from "@/lib/loads/post-problems";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    flow: PostFlow;
}

export default function PostFreightStep({ flow }: Props) {
    const { draft } = flow;
    const problems = useFormProblems<string>();
    const [failure, setFailure] = useState<string | null>(null);
    const form = useAppForm({
        ...freightFormOptions,
        defaultValues: draft.freight,
        onSubmit: async ({ value }) => {
            setFailure(null);
            problems.reset();
            try {
                const saved = await flow.persist(draft.lane, value);
                flow.dispatch({ type: "freight", freight: value, saved });
                flow.go("quote");
            } catch (error) {
                setFailure(saveFailureText(error));
            }
        },
        onSubmitInvalid: ({ value }) => problems.fail(freightProblems(value)),
    });
    const { onLeave } = flow;

    useEffect(() => onLeave(() => ({ type: "stash", freight: form.state.values })), [onLeave, form]);

    return (
        <PostStepFrame
            step="freight"
            focus={flow.moved}
            intro={FREIGHT_COPY.intro}
            onSubmit={() => void form.handleSubmit()}
            onBack={() => flow.go("lane")}
            pending={flow.saving}
            status={failure ? <p className="text-error text-xs">{failure}</p> : null}
        >
            <ErrorSummary
                problems={problems.problems}
                attempt={problems.attempt}
                heading={POST_COPY.errorsHeading}
                count={pluralize(problems.problems.length, POST_COPY.errorsCount)}
                fieldId={(field) => field}
            />
            <PostFreightFields form={form} />
        </PostStepFrame>
    );
}
