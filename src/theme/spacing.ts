/**
 * Consistent spacing scale (base unit: 4px).
 */
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,

  // Specific use cases
  screenPadding: 16,
  cardPadding: 16,
  sectionGap: 24,
  inputHeight: 48,
  buttonHeight: 48,
  iconSize: 24,
  avatarSize: 40,
  tabBarHeight: 60,
  headerHeight: 56,

  // Border radius
  borderRadiusSm: 4,
  borderRadiusMd: 8,
  borderRadiusLg: 12,
  borderRadiusXl: 16,
  borderRadiusFull: 9999,
} as const;
