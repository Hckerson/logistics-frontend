import { format } from "date-fns";
import { twoDigits } from "@/lib/utils/number";

export const dateFormatter = (date: string, formatString: string) => {
    if (!date) return "";
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? date : format(dateObj, formatString);
};

const SECONDS_PER_MINUTE = 60;

export const formatClock = (seconds: number) => `${twoDigits(Math.floor(seconds / SECONDS_PER_MINUTE))}:${twoDigits(seconds % SECONDS_PER_MINUTE)}`;
