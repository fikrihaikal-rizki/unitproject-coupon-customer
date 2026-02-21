import { format, isBefore, isAfter, addDays } from "date-fns";

export function dateToFormat(date: string | Date | null, formatStr: string = "dd MMM yyyy HH:mm:ss"): string {
    if (!date) return "-";
    return format(new Date(date).toISOString(), formatStr);
}

export function checkDateBefore(checkDate: string | Date | null, beforeDate: string | Date | null): boolean {
    if (!checkDate || !beforeDate) return false;
    return isBefore(dateToFormat(checkDate), dateToFormat(beforeDate));
}

export function checkDateAfter(checkDate: string | Date | null, afterDate: string | Date | null): boolean {
    if (!checkDate || !afterDate) return false;
    return isAfter(dateToFormat(checkDate), dateToFormat(afterDate));
}

export function checkDateBetween(checkDate: string | Date | null, beforeDate: string | Date | null, afterDate: string | Date | null): boolean {
    if (!checkDate || !beforeDate || !afterDate) return false;
    return isAfter(dateToFormat(checkDate), dateToFormat(beforeDate)) && isBefore(dateToFormat(checkDate), dateToFormat(afterDate));
}

export function addDaysToDate(date: string | Date | null, days: number): Date {
    if (!date) return new Date();
    return addDays(dateToFormat(date, "yyyy-MM-dd HH:mm:ss"), days);
}