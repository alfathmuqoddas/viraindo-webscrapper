import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/id"; //

// This function converts a string separated by spaces into lowercase and separated by dashes
// Example: "LIAN Li" → "lian-li", "COOLER MASTER" → "cooler-master"
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove everything except letters, digits, and spaces
    .trim()
    .replace(/\s+/g, "-"); // Replace one or more spaces with a single dash
}

// This function reverses the slugify function
// Example: "lian-li" → "LIAN LI", "cooler-master" → "COOLER MASTER"
export function reverseSlugify(text: string) {
  return text
    .replace(/-/g, " ") // Replace dashes with spaces first
    .replace(/[^a-z0-9\s]/g, "") // Remove anything that's not a letter, digit, or space
    .trim()
    .replace(/\s+/g, " ") // Collapse multiple spaces into a single space
    .toUpperCase(); // Convert to uppercase
}

export const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

type FormatType = "relative" | "localeUS" | "localeID" | "simple";

/**
 * Normalizes input (Firestore Timestamp, ISO string, or Date) into a Day.js object
 */
const parseToDayjs = (dateInput: any) => {
  if (!dateInput) return null;

  // Handle Firestore Timestamp
  if (typeof dateInput.toDate === "function") {
    return dayjs(dateInput.toDate());
  }
  // Handle Serialized Firestore Timestamp ({ seconds, nanoseconds })
  if (typeof dateInput.seconds === "number") {
    return dayjs(dateInput.seconds * 1000);
  }

  const d = dayjs(dateInput);
  return d.isValid() ? d : null;
};

/**
 * Core formatter using Day.js
 */
export const formatDate = (dateInput: any, type: FormatType): string => {
  const d = parseToDayjs(dateInput);
  if (!d) return "N/A";

  switch (type) {
    case "relative":
      return d.fromNow(); // e.g., "2 hours ago"

    case "localeUS":
      // Tuesday July 28 2026
      return d.locale("en").format("dddd, MMMM D YYYY");

    case "localeID":
      // Selasa 28 Juli 2026
      return d.locale("id").format("dddd, D MMMM YYYY");

    case "simple":
      // 28/07/2026
      return d.format("DD/MM/YYYY");

    default:
      return d.toISOString();
  }
};

// Wrappers matching your API requirements
export const formatTimestampDate = ({
  type,
  timestamp,
}: {
  type: FormatType;
  timestamp: any;
}) => formatDate(timestamp, type);

export const formatIsoDate = ({
  type,
  date,
}: {
  type: FormatType;
  date: string | Date | null | undefined;
}) => formatDate(date, type);
