/**
 * Utility functions for formatting pet-related data.
 */

/**
 * Calculates the age of a pet from its birth date and returns a
 * human-readable string in Portuguese.
 *
 * Rules:
 * - If age < 24 months → returns "{n} meses" (or "1 mês")
 * - If age >= 24 months → returns "{n} anos" (or "1 ano")
 *
 * @param birthDate - The pet's birth date as a Date object
 * @returns Age string in Portuguese
 */
export function calculatePetAge(birthDate: Date): string {
  const now = new Date();

  const totalMonths =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());

  // Adjust if the day of month hasn't been reached yet this month
  const adjustedMonths =
    now.getDate() < birthDate.getDate() ? totalMonths - 1 : totalMonths;

  const months = Math.max(0, adjustedMonths);

  if (months < 24) {
    return months === 1 ? '1 mês' : `${months} meses`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? '1 ano' : `${years} anos`;
}
