import { format } from "date-fns";
import { DATE_VALUE_FORMAT } from "@/lib/constants";
import { twoDigits } from "@/lib/utils/number";

export const todayValue = () => format(new Date(), DATE_VALUE_FORMAT);

export const dateFormatter = (date: string, formatString: string) => {
    if (!date) return "";
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? date : format(dateObj, formatString);
};

const SECONDS_PER_MINUTE = 60;

export const formatClock = (seconds: number) => `${twoDigits(Math.floor(seconds / SECONDS_PER_MINUTE))}:${twoDigits(seconds % SECONDS_PER_MINUTE)}`;
