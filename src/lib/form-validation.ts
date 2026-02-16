/**
 * P3-08：表單驗證規則標準化系統
 * 建立統一的表單驗證框架，支援即時驗證、錯誤反饋、國際化
 */

import { logger } from './logger'

// 驗證規則類型
export type ValidationRuleType = 
  | 'required'
  | 'email'
  | 'phone'
  | 'password'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'custom'

// 驗證規則定義
export interface ValidationRule {
  type: ValidationRuleType
  value?: unknown
  message: string
  condition?: (value: unknown, formValues: Record<string, unknown>) => boolean
}

// 表單欄位設定
export interface FormFieldConfig {
  name: string
  label: string
  type: string // input type
  rules: ValidationRule[]
  placeholder?: string
  required?: boolean
  defaultValue?: unknown
  helpText?: string
}

// 驗證結果
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

// 表單狀態
export interface FormState {
  values: Record<string, unknown>
  errors: Record<string, string[]>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}

/**
 * 1. 驗證規則引擎
 */

export class ValidationEngine {
  // 預設驗證規則
  private static defaultRules: Record<ValidationRuleType, (value: unknown, rule: ValidationRule) => boolean> = {
    required: (value) => value !== null && value !== undefined && value !== '',
    email: (value) => {
      if (value === '' || value === null || value === undefined) return true
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return typeof value === 'string' && emailRegex.test(value)
    },
    phone: (value) => {
      if (value === '' || value === null || value === undefined) return true
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      return typeof value === 'string' && phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))
    },
    password: (value) => {
      if (value === '' || value === null || value === undefined) return true
      // 至少 8 位，包含大小寫字母和數字
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
      return typeof value === 'string' && passwordRegex.test(value)
    },
    minLength: (value, rule) => {
      if (value === '' || value === null || value === undefined) return true
      const minLength = Number(rule.value) || 0
      return typeof value === 'string' && value.length >= minLength
    },
    maxLength: (value, rule) => {
      if (value === '' || value === null || value === undefined) return true
      const maxLength = Number(rule.value) || 0
      return typeof value === 'string' && value.length <= maxLength
    },
    min: (value, rule) => {
      if (value === '' || value === null || value === undefined) return true
      const minValue = Number(rule.value) || 0
      const numValue = Number(value)
      return !isNaN(numValue) && numValue >= minValue
    },
    max: (value, rule) => {
      if (value === '' || value === null || value === undefined) return true
      const maxValue = Number(rule.value) || 0
      const numValue = Number(value)
      return !isNaN(numValue) && numValue <= maxValue
    },
    pattern: (value, rule) => {
      if (value === '' || value === null || value === undefined) return true
      if (!(rule.value instanceof RegExp)) return false
      return typeof value === 'string' && rule.value.test(value)
    },
    custom: (value, rule) => {
      if (rule.condition) {
        // For custom validation, we pass empty form values as second parameter
        return rule.condition(value, {})
      }
      return true
    }
  }

  // 驗證單一欄位
  static validateField(value: unknown, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    for (const rule of rules) {
      const validator = this.defaultRules[rule.type]
      if (validator && !validator(value, rule)) {
        errors.push(rule.message)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 驗證整個表單
  static validateForm(
    values: Record<string, unknown>,
    fieldConfigs: FormFieldConfig[]
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}
    
    fieldConfigs.forEach(field => {
      const value = values[field.name]
      results[field.name] = this.validateField(value, field.rules)
    })
    
    return results
  }

  // 檢查表單是否完全有效
  static isFormValid(validationResults: Record<string, ValidationResult>): boolean {
    return Object.values(validationResults).every(result => result.isValid)
  }
}

/**
 * 2. 表單設定管理器
 */

export class FormConfigManager {
  private static configs: Record<string, FormFieldConfig[]> = {}

  // 註冊表單設定
  static registerForm(formId: string, fields: FormFieldConfig[]): void {
    this.configs[formId] = fields
  }

  // 取得表單設定
  static getFormConfig(formId: string): FormFieldConfig[] | null {
    return this.configs[formId] || null
  }

  // 建立常見表單設定
  static createCommonConfigs(): void {
    // 登入表單
    this.registerForm('login', [
      {
        name: 'email',
        label: '電子郵件',
        type: 'email',
        required: true,
        rules: [
          { type: 'required', message: '請輸入電子郵件' },
          { type: 'email', message: '請輸入有效的電子郵件地址' }
        ],
        placeholder: 'your@email.com'
      },
      {
        name: 'password',
        label: '密碼',
        type: 'password',
        required: true,
        rules: [
          { type: 'required', message: '請輸入密碼' }
        ],
        placeholder: '••••••••'
      }
    ])

    // 註冊表單
    this.registerForm('register', [
      {
        name: 'name',
        label: '姓名',
        type: 'text',
        required: true,
        rules: [
          { type: 'required', message: '請輸入姓名' },
          { type: 'minLength', value: 2, message: '姓名至少需要 2 個字元' },
          { type: 'maxLength', value: 50, message: '姓名不能超過 50 個字元' }
        ],
        placeholder: '請輸入您的姓名'
      },
      {
        name: 'email',
        label: '電子郵件',
        type: 'email',
        required: true,
        rules: [
          { type: 'required', message: '請輸入電子郵件' },
          { type: 'email', message: '請輸入有效的電子郵件地址' }
        ],
        placeholder: 'your@email.com'
      },
      {
        name: 'password',
        label: '密碼',
        type: 'password',
        required: true,
        rules: [
          { type: 'required', message: '請輸入密碼' },
          { type: 'minLength', value: 8, message: '密碼至少需要 8 個字元' },
          { type: 'password', message: '密碼需包含大小寫字母和數字' }
        ],
        placeholder: '至少 8 位，包含大小寫字母和數字'
      },
      {
        name: 'confirmPassword',
        label: '確認密碼',
        type: 'password',
        required: true,
        rules: [
          { type: 'required', message: '請確認密碼' },
          {
            type: 'custom',
            condition: (value, formValues) => {
              return value === (formValues as Record<string, unknown>)?.password
            },
            message: '密碼不一致'
          }
        ],
        placeholder: '請再次輸入密碼'
      }
    ])

    // 聯絡表單
    this.registerForm('contact', [
      {
        name: 'name',
        label: '姓名',
        type: 'text',
        required: true,
        rules: [
          { type: 'required', message: '請輸入姓名' }
        ],
        placeholder: '請輸入您的姓名'
      },
      {
        name: 'email',
        label: '電子郵件',
        type: 'email',
        required: true,
        rules: [
          { type: 'required', message: '請輸入電子郵件' },
          { type: 'email', message: '請輸入有效的電子郵件地址' }
        ],
        placeholder: 'your@email.com'
      },
      {
        name: 'subject',
        label: '主旨',
        type: 'text',
        required: true,
        rules: [
          { type: 'required', message: '請輸入主旨' },
          { type: 'minLength', value: 5, message: '主旨至少需要 5 個字元' }
        ],
        placeholder: '請簡述您的問題'
      },
      {
        name: 'message',
        label: '訊息',
        type: 'textarea',
        required: true,
        rules: [
          { type: 'required', message: '請輸入訊息' },
          { type: 'minLength', value: 20, message: '訊息至少需要 20 個字元' }
        ],
        placeholder: '請詳細描述您的問題或建議...',
        helpText: '請盡量詳細描述，我們會盡快回覆您'
      }
    ])

    // 遊戲房間建立表單
    this.registerForm('create-room', [
      {
        name: 'roomName',
        label: '房間名稱',
        type: 'text',
        required: true,
        rules: [
          { type: 'required', message: '請輸入房間名稱' },
          { type: 'minLength', value: 3, message: '房間名稱至少需要 3 個字元' },
          { type: 'maxLength', value: 30, message: '房間名稱不能超過 30 個字元' }
        ],
        placeholder: '輸入房間名稱'
      },
      {
        name: 'maxPlayers',
        label: '最大人數',
        type: 'number',
        required: true,
        rules: [
          { type: 'required', message: '請設定最大人數' },
          { type: 'min', value: 2, message: '最少需要 2 人' },
          { type: 'max', value: 12, message: '最多 12 人' }
        ],
        defaultValue: 6
      },
      {
        name: 'password',
        label: '房間密碼（選填）',
        type: 'password',
        required: false,
        rules: [
          { type: 'minLength', value: 4, message: '密碼至少需要 4 個字元' },
          { type: 'maxLength', value: 20, message: '密碼不能超過 20 個字元' }
        ],
        placeholder: '設定房間密碼'
      }
    ])
  }

  // 取得所有註冊的表單
  static getAllForms(): string[] {
    return Object.keys(this.configs)
  }
}

/**
 * 3. 表單狀態管理器
 */

export class FormStateManager {
  private formStates: Record<string, FormState> = {}

  // 初始化表單狀態
  initializeForm(formId: string, initialValues: Record<string, unknown> = {}): void {
    const config = FormConfigManager.getFormConfig(formId)
    if (!config) {
      logger.warn('Form config not found', { formId })
      return
    }

    const values: Record<string, unknown> = {}
    const errors: Record<string, string[]> = {}
    const touched: Record<string, boolean> = {}

    config.forEach(field => {
      values[field.name] = initialValues[field.name] ?? field.defaultValue ?? ''
      errors[field.name] = []
      touched[field.name] = false
    })

    this.formStates[formId] = {
      values,
      errors,
      touched,
      isSubmitting: false,
      isValid: false
    }
  }

  // 更新欄位值
  updateFieldValue(formId: string, fieldName: string, value: unknown): void {
    const state = this.formStates[formId]
    if (!state) return

    state.values[fieldName] = value
    state.touched[fieldName] = true

    // 即時驗證
    const config = FormConfigManager.getFormConfig(formId)
    const fieldConfig = config?.find(field => field.name === fieldName)
    
    if (fieldConfig) {
      const validationResult = ValidationEngine.validateField(value, fieldConfig.rules)
      state.errors[fieldName] = validationResult.errors
      this.updateFormValidity(formId)
    }
  }

  // 驗證整個表單
  validateForm(formId: string): boolean {
    const state = this.formStates[formId]
    if (!state) return false

    const config = FormConfigManager.getFormConfig(formId)
    if (!config) return false

    const validationResults = ValidationEngine.validateForm(state.values, config)
    
    // 更新錯誤狀態
    Object.entries(validationResults).forEach(([fieldName, result]) => {
      state.errors[fieldName] = result.errors
      state.touched[fieldName] = true
    })

    this.updateFormValidity(formId)
    return state.isValid
  }

  // 更新表單有效性
  private updateFormValidity(formId: string): void {
    const state = this.formStates[formId]
    if (!state) return

    const config = FormConfigManager.getFormConfig(formId)
    if (!config) return

    const validationResults = ValidationEngine.validateForm(state.values, config)
    state.isValid = ValidationEngine.isFormValid(validationResults)
  }

  // 設定提交狀態
  setSubmitting(formId: string, isSubmitting: boolean): void {
    const state = this.formStates[formId]
    if (state) {
      state.isSubmitting = isSubmitting
    }
  }

  // 取得表單狀態
  getFormState(formId: string): FormState | null {
    return this.formStates[formId] || null
  }

  // 重置表單
  resetForm(formId: string): void {
    const state = this.formStates[formId]
    if (state) {
      const config = FormConfigManager.getFormConfig(formId)
      if (config) {
        config.forEach(field => {
          state.values[field.name] = field.defaultValue ?? ''
          state.errors[field.name] = []
          state.touched[field.name] = false
        })
        state.isSubmitting = false
        state.isValid = false
      }
    }
  }

  // 清除表單
  clearForm(formId: string): void {
    delete this.formStates[formId]
  }
}

/**
 * 4. 國際化支援
 */

// 驗證訊息翻譯
export const validationMessages = {
  zh: {
    required: '此欄位為必填',
    email: '請輸入有效的電子郵件地址',
    phone: '請輸入有效的電話號碼',
    password: '密碼需包含大小寫字母和數字',
    minLength: '至少需要 {min} 個字元',
    maxLength: '不能超過 {max} 個字元',
    min: '數值不能小於 {min}',
    max: '數值不能大於 {max}',
    pattern: '格式不符合要求',
    custom: '輸入值不符合要求'
  },
  en: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    password: 'Password must contain uppercase, lowercase letters and numbers',
    minLength: 'Must be at least {min} characters',
    maxLength: 'Cannot exceed {max} characters',
    min: 'Value cannot be less than {min}',
    max: 'Value cannot be greater than {max}',
    pattern: 'Format does not match requirements',
    custom: 'Value does not meet requirements'
  }
}

// 取得本地化驗證訊息
export function getLocalizedMessage(
  key: keyof typeof validationMessages.zh,
  locale: 'zh' | 'en' = 'zh',
  params: Record<string, string | number> = {}
): string {
  let message = validationMessages[locale][key] || validationMessages.zh[key]
  
  // 替換參數
  Object.entries(params).forEach(([param, value]) => {
    message = message.replace(`{${param}}`, String(value))
  })
  
  return message
}

/**
 * 5. 主要使用介面
 */

// 初始化表單設定
FormConfigManager.createCommonConfigs()

// 建立全域表單狀態管理器
const globalFormManager = new FormStateManager()

export function useFormManager(formId: string) {
  const initialize = (initialValues?: Record<string, unknown>) => {
    globalFormManager.initializeForm(formId, initialValues)
  }

  const updateValue = (fieldName: string, value: unknown) => {
    globalFormManager.updateFieldValue(formId, fieldName, value)
  }

  const validate = () => {
    return globalFormManager.validateForm(formId)
  }

  const getState = () => {
    return globalFormManager.getFormState(formId)
  }

  const setSubmitting = (isSubmitting: boolean) => {
    globalFormManager.setSubmitting(formId, isSubmitting)
  }

  const reset = () => {
    globalFormManager.resetForm(formId)
  }

  const clear = () => {
    globalFormManager.clearForm(formId)
  }

  return {
    initialize,
    updateValue,
    validate,
    getState,
    setSubmitting,
    reset,
    clear
  }
}
