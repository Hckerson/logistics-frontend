import { format } from "date-fns";

export const dateFormatter = (date: string, formatString: string) => {
    if (!date) return "";
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? date : format(dateObj, formatString);
};

const SECONDS_PER_MINUTE = 60;
const pad = (value: number) => String(value).padStart(2, "0");

export const formatClock = (seconds: number) => `${pad(Math.floor(seconds / SECONDS_PER_MINUTE))}:${pad(seconds % SECONDS_PER_MINUTE)}`;
