export type AnnouncementTone = "polite" | "assertive";

export interface AnnouncementAction {
    label: string;
    href: string;
}

export interface AnnouncementInput {
    message: string;
    tone?: AnnouncementTone;
    action?: AnnouncementAction;
}

export interface Announcement extends AnnouncementInput {
    id: string;
    tone: AnnouncementTone;
}

export interface AnnouncementQueue {
    current: Announcement | null;
    waiting: readonly Announcement[];
}
