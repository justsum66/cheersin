'use client'

/**
 * UX_LAYOUT_200 #83：錯誤訊息 id 與 input aria-describedby 關聯
 * 用法：<input aria-describedby={error ? 'field-email-error' : undefined} />
 *       <FormFieldError id="field-email-error">{error}</FormFieldError>
 */
export function FormFieldError({
  id,
  children,
  className = '',
}: {
  id: string
  children: React.ReactNode
  className?: string
}) {
  if (!children) return null
  return (
    <span
      id={id}
      role="alert"
      className={`field-error break-words overflow-visible ${className}`}
    >
      {children}
    </span>
  )
}
