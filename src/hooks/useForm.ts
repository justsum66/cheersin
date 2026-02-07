/**
 * 表單驗證 Hook
 * 統一管理表單狀態與驗證邏輯
 */

import { useState, useCallback, ChangeEvent } from 'react'

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

export interface FormField {
  value: string
  error: string | null
  touched: boolean
}

export interface UseFormOptions<T extends string> {
  initialValues: Record<T, string>
  validations: Partial<Record<T, FieldValidation>>
  onSubmit: (values: Record<T, string>) => void | Promise<void>
}

export function useForm<T extends string>(options: UseFormOptions<T>) {
  const { initialValues, validations, onSubmit } = options

  const [fields, setFields] = useState<Record<T, FormField>>(() => {
    const initial = {} as Record<T, FormField>
    for (const key in initialValues) {
      initial[key] = {
        value: initialValues[key],
        error: null,
        touched: false
      }
    }
    return initial
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 驗證單一欄位
  const validateField = useCallback((name: T, value: string): string | null => {
    const validation = validations[name]
    if (!validation) return null

    if (validation.required && !value.trim()) {
      return '此欄位為必填'
    }

    if (validation.minLength && value.length < validation.minLength) {
      return `至少需要 ${validation.minLength} 個字元`
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      return `最多 ${validation.maxLength} 個字元`
    }

    if (validation.pattern && !validation.pattern.test(value)) {
      return '格式不正確'
    }

    if (validation.custom) {
      return validation.custom(value)
    }

    return null
  }, [validations])

  // 處理輸入變更
  const handleChange = useCallback((name: T) => {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      setFields(prev => ({
        ...prev,
        [name]: {
          value,
          error: prev[name].touched ? validateField(name, value) : null,
          touched: prev[name].touched
        }
      }))
    }
  }, [validateField])

  // 處理失焦（觸發驗證）
  const handleBlur = useCallback((name: T) => {
    return () => {
      setFields(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          error: validateField(name, prev[name].value),
          touched: true
        }
      }))
    }
  }, [validateField])

  // 驗證所有欄位
  const validateAll = useCallback((): boolean => {
    let isValid = true
    const newFields = { ...fields }

    for (const name in fields) {
      const error = validateField(name, fields[name].value)
      newFields[name] = {
        ...fields[name],
        error,
        touched: true
      }
      if (error) isValid = false
    }

    setFields(newFields)
    return isValid
  }, [fields, validateField])

  // 處理表單提交
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAll()) return

    setIsSubmitting(true)
    try {
      const values = {} as Record<T, string>
      for (const name in fields) {
        values[name] = fields[name].value
      }
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [fields, validateAll, onSubmit])

  // 重置表單
  const reset = useCallback(() => {
    const initial = {} as Record<T, FormField>
    for (const key in initialValues) {
      initial[key] = {
        value: initialValues[key],
        error: null,
        touched: false
      }
    }
    setFields(initial)
  }, [initialValues])

  // 設定欄位值
  const setValue = useCallback((name: T, value: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value
      }
    }))
  }, [])

  const isValid = Object.keys(fields).every((key) => {
    const field = fields[key as T]
    return !field.error
  })

  return {
    fields,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
    isSubmitting,
    isValid
  }
}
