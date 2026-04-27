interface EmptyStateProps {
  message: string
  icon?: string
}

export function EmptyState({ message, icon = '📭' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400 gap-3">
      <span className="text-5xl">{icon}</span>
      <p className="text-lg">{message}</p>
    </div>
  )
}
