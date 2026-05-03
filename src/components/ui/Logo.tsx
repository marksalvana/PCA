type Variant = 'dark' | 'light'

const COLORS: Record<Variant, { wordmark: string; eye: string; iris: string; check: string }> = {
  // Header on cream background — matches public/politiko-logo.svg
  dark:  { wordmark: '#1B2A4A', eye: '#1B2A4A', iris: '#1B2A4A', check: '#C8304B' },
  // Footer on deep-blue background — same shape, inverted colors
  light: { wordmark: '#FBF5EB', eye: '#FBF5EB', iris: '#FBF5EB', check: '#C8304B' },
}

type Props = {
  variant?: Variant
  /** Rendered height in px; width is derived from the 775x254 viewBox */
  height?: number
  /** Optional label override for accessibility */
  ariaLabel?: string
}

/**
 * Politiko brand logo — wordmark "Politik" + eye-with-checkmark icon
 * acting as the final "o". Same geometry as public/politiko-logo.svg.
 *
 * Use variant="dark" on light backgrounds (header) and variant="light"
 * on dark backgrounds (footer). Both render the same shape so the brand
 * stays consistent.
 */
export default function Logo({ variant = 'dark', height = 32, ariaLabel = 'Politiko' }: Props) {
  const c = COLORS[variant]
  const width = (height * 775) / 254

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox="0 0 775 254"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="8"
        y="230"
        fontFamily="'Public Sans', system-ui, sans-serif"
        fontWeight={600}
        fontSize={200}
        letterSpacing={-4}
        fill={c.wordmark}
      >
        Politik
      </text>
      <g transform="translate(581 80)">
        <g transform="scale(1.2567567567567568 1.5833333333333333)">
          <path
            d="M6 60 Q74 6 142 60 Q74 114 6 60 Z"
            stroke={c.eye}
            strokeWidth={6}
            fill="none"
            strokeLinejoin="round"
          />
          <circle cx={74} cy={60} r={27} fill={c.iris} />
          <polyline
            points="63.2,60.54 71.84,68.64 86.96,52.44"
            fill="none"
            stroke={c.check}
            strokeWidth={6.48}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  )
}
