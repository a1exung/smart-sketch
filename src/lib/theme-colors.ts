/**
 * Smart Sketch Theme Color Schemes
 * Central location for consistent color styling across the application
 */

export const themeColors = {
  // Gradient Header - Used in modal headers and prominent sections
  gradientHeader: {
    bg: 'bg-gradient-to-r from-blue-900 to-purple-900',
    text: 'text-white',
    description: 'text-gray-300',
  },

  // Dark Theme - Neural Network Background Compatible
  dark: {
    bg: 'bg-gray-900',
    bgAlt: 'bg-gray-800',
    border: 'border-gray-700',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
  },

  // Accent Colors
  accent: {
    blue: {
      light: 'from-blue-400',
      medium: 'from-blue-500',
      dark: 'from-blue-900',
    },
    purple: {
      light: 'from-purple-400',
      medium: 'from-purple-500',
      dark: 'to-purple-900',
    },
  },

  // Neural Network Nodes
  neuralNetwork: {
    primary: '#3b82f6', // Bright Blue
    secondary: '#8b5cf6', // Vibrant Purple
    glow: '#60a5fa', // Light Blue
    connections: '#a78bf6', // Light Purple
  },
};

// Helper function to combine gradient classes
export const getGradientHeader = () =>
  `${themeColors.gradientHeader.bg} ${themeColors.gradientHeader.text}`;

export const getDarkTheme = () =>
  `${themeColors.dark.bg} ${themeColors.dark.border} ${themeColors.dark.text}`;
