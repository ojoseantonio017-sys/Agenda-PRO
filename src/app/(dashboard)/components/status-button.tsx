'use client'

interface StatusButtonProps {
  action: () => Promise<void>
  label: string
  confirmMessage: string
  style?: React.CSSProperties
}

export default function StatusButton({ action, label, confirmMessage, style }: StatusButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault()
      }}
    >
      <button type="submit" style={style}>
        {label}
      </button>
    </form>
  )
}
