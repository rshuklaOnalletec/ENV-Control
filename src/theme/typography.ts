import { TextStyle } from 'react-native';

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
} as const;

export const FontWeights: Record<string, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const Typography: Record<string, TextStyle> = {
  displayLarge: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.bold,
    lineHeight: 44,
  },
  displayMedium: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    lineHeight: 38,
  },
  heading1: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    lineHeight: 32,
  },
  heading2: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: 28,
  },
  heading3: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.regular,
    lineHeight: 24,
  },
  body: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.regular,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    lineHeight: 18,
  },
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.regular,
    lineHeight: 16,
  },
  button: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    lineHeight: 22,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: 18,
  },
};
