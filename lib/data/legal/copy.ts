import { AUTH_COPY } from "@/lib/data/auth/shared";

export const LEGAL_COPY = {
    label: "Legal",
    note: AUTH_COPY.note,
    placeholder: "Placeholder text for a design study. Not a binding agreement.",
    documents: "Documents",
    contents: "On this page",
    record: {
        label: "Document record",
        current: "In effect",
        superseded: "Superseded",
        version: "Version",
        effective: "Effective",
        replaced: "Replaced",
        broker: "Broker authority",
        brokerValue: "MC-000000",
        print: "Print",
    },
    supersededBody: "You're reading an earlier version. Version {version} replaced it on {date}.",
    readCurrent: "Read the current version",
    changes: "What changed in version {version}",
    revision: { new: "New in {version}", changed: "Changed in {version}" },
    clauseLink: "Link to section {number}, {title}",
    providers: {
        title: "Service providers",
        caption: "Service providers that receive personal data, and what each receives",
        columns: { name: "Provider", purpose: "Purpose", data: "Data shared", location: "Location" },
    },
    history: { label: "Version history", current: "Current", reading: "Reading", read: "Read version {version}" },
    meta: { title: "{title} · Haulr", version: "{title} {version} · Haulr" },
} as const;
