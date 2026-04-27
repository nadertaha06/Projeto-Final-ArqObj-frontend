interface StarRatingProps {
  value: number
  max?: number
  onChange?: (value: number) => void
}

export function StarRating({ value, max = 5, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`text-2xl transition-colors ${
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          } ${onChange ? 'cursor-pointer hover:text-yellow-300' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
