"use client";
import { Component, type ReactNode } from "react";
import SectionFailure from "@/components/common/section-failure";

interface Props {
    label: string;
    children: ReactNode;
}

interface State {
    failed: boolean;
}

export default class SectionBoundary extends Component<Props, State> {
    state: State = { failed: false };

    static getDerivedStateFromError(): State {
        return { failed: true };
    }

    render() {
        if (!this.state.failed) return this.props.children;
        return <SectionFailure label={this.props.label} failure={null} onRetry={() => this.setState({ failed: false })} />;
    }
}
