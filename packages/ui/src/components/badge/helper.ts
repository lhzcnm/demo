export const BADGE_COLORS = ['primary', 'success', 'warning', 'danger'] as const
export type BadgeColor = (typeof BADGE_COLORS)[number]

export interface BadgeProps {
  color?: BadgeColor
  limit?: number
  size?: 'sm' | 'md'
  value: number
}
