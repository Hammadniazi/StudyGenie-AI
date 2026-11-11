/**
 * Recharts takes colours as props, not classes. Point them at CSS variables so
 * charts follow the active theme without re-rendering.
 */
export const chartTheme = {
  series: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'],
  grid: 'var(--chart-grid)',
  tick: { fill: 'var(--chart-tick)', fontSize: 12 },
  tooltip: {
    contentStyle: {
      background: 'var(--popover)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      color: 'var(--popover-foreground)',
      boxShadow: 'var(--shadow-md)',
      fontSize: 13,
    },
    labelStyle: { color: 'var(--muted-foreground)', marginBottom: 4 },
    itemStyle: { color: 'var(--popover-foreground)' },
    cursor: { fill: 'var(--muted)' },
  },
} as const
