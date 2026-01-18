/**
 * Utility functions for deduplicating and grouping similar concepts
 */

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a score between 0 and 1, where 1 is identical
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Check if one is a substring of the other (for phrases like "transactions" vs "types of transactions")
  if (s1.includes(s2) || s2.includes(s1)) {
    const minLength = Math.min(s1.length, s2.length);
    const maxLength = Math.max(s1.length, s2.length);
    return minLength / maxLength;
  }

  // Levenshtein distance
  const matrix: number[][] = [];

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
}

/**
 * Find the best match for a concept in existing concepts
 * Returns the ID of the matching concept or null if no good match found
 */
export function findSimilarConcept(
  newLabel: string,
  existingConcepts: Array<{ id: string; label: string }>,
  threshold: number = 0.75
): string | null {
  let bestMatch: { id: string; score: number } | null = null;

  for (const existing of existingConcepts) {
    const similarity = calculateStringSimilarity(newLabel, existing.label);
    if (similarity >= threshold) {
      if (!bestMatch || similarity > bestMatch.score) {
        bestMatch = { id: existing.id, score: similarity };
      }
    }
  }

  return bestMatch?.id || null;
}

/**
 * Group similar concepts together and return a mapping of original IDs to canonical IDs
 */
export function deduplicateConcepts(
  concepts: Array<{ id: string; label: string }>,
  threshold: number = 0.75
): Map<string, string> {
  const mapping = new Map<string, string>(); // original ID -> canonical ID
  const seenLabels: Array<{ id: string; label: string }> = [];

  for (const concept of concepts) {
    const similarId = findSimilarConcept(concept.label, seenLabels, threshold);

    if (similarId) {
      // Use the existing canonical concept
      mapping.set(concept.id, similarId);
    } else {
      // This is a new unique concept
      mapping.set(concept.id, concept.id);
      seenLabels.push(concept);
    }
  }

  return mapping;
}
