// This function converts a string separated by spaces into lowercase and separated by dashes
// Example: "LIAN Li" → "lian-li", "COOLER MASTER" → "cooler-master"
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove everything except letters, digits, and spaces
    .trim()
    .replace(/\s+/g, "-"); // Replace one or more spaces with a single dash
}

// This function reverses the slugify function
// Example: "lian-li" → "LIAN LI", "cooler-master" → "COOLER MASTER"
export function reverseSlugify(text) {
  return text
    .replace(/-/g, " ") // Replace dashes with spaces first
    .replace(/[^a-z0-9\s]/g, "") // Remove anything that's not a letter, digit, or space
    .trim()
    .replace(/\s+/g, " ") // Collapse multiple spaces into a single space
    .toUpperCase(); // Convert to uppercase
}
