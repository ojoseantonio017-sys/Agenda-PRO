'use client'

interface DeleteButtonProps {
  action: () => Promise<void>
  label?: string
  confirmMessage?: string
}

export default function DeleteButton({
  action,
  label = 'Excluir',
  confirmMessage = 'Tem certeza que deseja excluir? Esta ação não pode ser desfeita.',
}: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault()
      }}
    >
      <button
        type="submit"
        style={{
          fontSize: 12, fontWeight: 700, padding: '0.4rem 0.75rem', borderRadius: 7, border: 'none',
          background: 'rgba(239,68,68,0.06)', color: '#ef4444',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {label}
      </button>
    </form>
  )
}
