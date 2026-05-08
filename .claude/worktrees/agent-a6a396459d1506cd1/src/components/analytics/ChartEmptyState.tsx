interface Props {
  heading: string
  body: string
}

export function ChartEmptyState({ heading, body }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-[16px] font-[600] text-accent-silver mb-1">{heading}</p>
      <p className="text-[14px] font-[400] text-accent-silver/70 max-w-xs">{body}</p>
    </div>
  )
}
