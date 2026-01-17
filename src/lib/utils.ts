// Utility functions for Smart Sketch

import { Concept } from '@/types';

/**
 * Generate a unique ID for a concept
 */
export function generateConceptId(): string {
  return `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate layout positions for mind map nodes
 */
export function calculateNodePosition(
  index: number,
  type: 'main' | 'concept' | 'detail',
  parentPosition?: { x: number; y: number }
): { x: number; y: number } {
  switch (type) {
    case 'main':
      return { x: 400, y: 50 + index * 150 };
    case 'concept':
      const angle = (index * Math.PI * 2) / Math.max(index + 1, 4);
      return {
        x: 400 + Math.cos(angle) * 250,
        y: 200 + Math.sin(angle) * 200,
      };
    case 'detail':
      if (parentPosition) {
        return {
          x: parentPosition.x + (index % 2 === 0 ? 150 : -150),
          y: parentPosition.y + 100 + Math.floor(index / 2) * 80,
        };
      }
      return { x: 200 + index * 150, y: 400 };
  }
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, count: number = 5): string[] {
  // Simple keyword extraction (in production, use a more sophisticated NLP library)
  const words = text.toLowerCase().split(/\W+/);
  const wordFreq = new Map<string, number>();
  
  // Filter out common words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being']);
  
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });
  
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Merge new concepts with existing ones, avoiding duplicates
 */
export function mergeConcepts(existing: Concept[], newConcepts: Concept[]): Concept[] {
  const merged = [...existing];
  const existingLabels = new Set(existing.map(c => c.label.toLowerCase()));
  
  newConcepts.forEach(concept => {
    if (!existingLabels.has(concept.label.toLowerCase())) {
      merged.push({
        ...concept,
        id: concept.id || generateConceptId(),
        timestamp: concept.timestamp || Date.now(),
      });
      existingLabels.add(concept.label.toLowerCase());
    }
  });
  
  return merged;
}
