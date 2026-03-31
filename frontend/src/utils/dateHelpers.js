/**
 * Checks if a specific month should be disabled based on the selected year and current date.
 * @param {number} monthIndex - The index of the month (0-11).
 * @param {number} selectedYear - The year selected by the user.
 * @param {Date} [currentDate] - Optional current date (defaults to now).
 * @returns {boolean} - True if the month is in the future relative to the current date.
 */
export const isMonthDisabled = (monthIndex, selectedYear, currentDate = new Date()) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  if (selectedYear > currentYear) {
    return true; // All months in future years are disabled
  }

  if (selectedYear < currentYear) {
    return false; // All months in past years are enabled
  }

  // Same year: Disable if month is strictly greater than current month
  return monthIndex > currentMonth;
};

/**
 * Formats a date string into a localized Indonesian date (e.g., 30 Maret 2026).
 */
export const formatDateIndo = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Formats a number with Indonesian thousand separators.
 */
export const formatNumberIndo = (num) => {
  if (num === undefined || num === null || isNaN(num)) return "0";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(num);
};
