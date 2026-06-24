import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { formatCurrency } from '../lib/format'

type AnimatedNumberProps = {
  value: number
  className?: string
  style?: React.CSSProperties
}

export default function AnimatedNumber({ value, className, style }: AnimatedNumberProps) {
  const animated = useAnimatedNumber(value)
  return (
    <span className={className} style={style}>
      {formatCurrency(Math.round(animated))}
    </span>
  )
}
