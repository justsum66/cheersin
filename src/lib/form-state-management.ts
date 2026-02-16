/**
 * P3-09：表單狀態管理系統
 * 提供完整的表單狀態追蹤、驗證、提交處理和錯誤管理
 */

import { logger } from './logger'
import { ValidationEngine, FormConfigManager, type FormFieldConfig, type ValidationResult } from './form-validation'

// 表單提交處理器
export interface FormSubmitHandler {
  (values: Record<string, unknown>): Promise<void> | void
}

// 表單錯誤處理器
export interface FormErrorHandler {
  (errors: Record<string, string[]>): void
}

// 表單事件處理器
export interface FormEventHandlers {
  onSubmit?: FormSubmitHandler
  onError?: FormErrorHandler
  onFieldChange?: (fieldName: string, value: unknown) => void
  onFieldBlur?: (fieldName: string) => void
  onFieldFocus?: (fieldName: string) => void
}

// 表單設定
export interface FormSettings {
  validateOnBlur?: boolean
  validateOnChange?: boolean
  validateOnSubmit?: boolean
  resetOnSubmit?: boolean
  keepDirtyOnReinitialize?: boolean
}

// 表單狀態快照
export interface FormSnapshot {
  values: Record<string, unknown>
  errors: Record<string, string[]>
  touched: Record<string, boolean>
  dirty: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  submitCount: number
}

/**
 * 1. 表單狀態管理核心類別
 */
class FormStateTracker {
  private formId: string
  private config: FormFieldConfig[]
  private initialValues: Record<string, unknown>
  private currentValues: Record<string, unknown>
  private errors: Record<string, string[]>
  private touched: Record<string, boolean>
  private dirty: Record<string, boolean>
  private isSubmitting: boolean
  private isValid: boolean
  private submitCount: number
  private eventHandlers: FormEventHandlers
  private settings: FormSettings
  private subscribers: Array<(snapshot: FormSnapshot) => void> = []

  constructor(
    formId: string,
    config: FormFieldConfig[],
    initialValues: Record<string, unknown> = {},
    settings: FormSettings = {},
    eventHandlers: FormEventHandlers = {}
  ) {
    this.formId = formId
    this.config = config
    this.initialValues = { ...initialValues }
    this.currentValues = { ...initialValues }
    this.errors = {}
    this.touched = {}
    this.dirty = {}
    this.isSubmitting = false
    this.isValid = false
    this.submitCount = 0
    this.eventHandlers = eventHandlers
    this.settings = {
      validateOnBlur: true,
      validateOnChange: true,
      validateOnSubmit: true,
      resetOnSubmit: false,
      keepDirtyOnReinitialize: false,
      ...settings
    }

    // 初始化狀態
    this.initializeState()
    this.validateForm()
  }

  // 初始化狀態
  private initializeState(): void {
    this.config.forEach(field => {
      const fieldName = field.name
      this.errors[fieldName] = []
      this.touched[fieldName] = false
      this.dirty[fieldName] = false
      
      // 如果沒有初始值，設定預設值
      if (!(fieldName in this.currentValues) && field.defaultValue !== undefined) {
        this.currentValues[fieldName] = field.defaultValue
      }
    })
  }

  // 訂閱狀態變更
  subscribe(callback: (snapshot: FormSnapshot) => void): () => void {
    this.subscribers.push(callback)
    
    // 立即發送當前狀態
    callback(this.getSnapshot())
    
    // 返回取消訂閱函數
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  // 通知所有訂閱者
  private notifySubscribers(): void {
    const snapshot = this.getSnapshot()
    this.subscribers.forEach(callback => {
      try {
        callback(snapshot)
      } catch (error) {
        logger.error('Form subscriber error', { error, formId: this.formId })
      }
    })
  }

  // 取得狀態快照
  getSnapshot(): FormSnapshot {
    return {
      values: { ...this.currentValues },
      errors: { ...this.errors },
      touched: { ...this.touched },
      dirty: { ...this.dirty },
      isSubmitting: this.isSubmitting,
      isValid: this.isValid,
      submitCount: this.submitCount
    }
  }

  // 更新欄位值
  setFieldValue(fieldName: string, value: unknown, shouldValidate = true): void {
    // 檢查欄位是否存在
    if (!this.config.some(field => field.name === fieldName)) {
      logger.warn('Field not found in form config', { fieldName, formId: this.formId })
      return
    }

    // 更新值
    const previousValue = this.currentValues[fieldName]
    this.currentValues[fieldName] = value
    
    // 標記為 dirty（如果值有變更）
    if (previousValue !== value) {
      this.dirty[fieldName] = true
    }

    // 觸發 onChange 事件
    if (this.eventHandlers.onFieldChange) {
      this.eventHandlers.onFieldChange(fieldName, value)
    }

    // 即時驗證
    if (shouldValidate && this.settings.validateOnChange) {
      this.validateField(fieldName)
    }

    this.notifySubscribers()
  }

  // 設定多個欄位值
  setValues(values: Record<string, unknown>, shouldValidate = true): void {
    Object.entries(values).forEach(([fieldName, value]) => {
      this.setFieldValue(fieldName, value, false)
    })

    if (shouldValidate) {
      this.validateForm()
    }
  }

  // 處理欄位 Blur 事件
  handleFieldBlur(fieldName: string): void {
    this.touched[fieldName] = true

    if (this.eventHandlers.onFieldBlur) {
      this.eventHandlers.onFieldBlur(fieldName)
    }

    if (this.settings.validateOnBlur) {
      this.validateField(fieldName)
    }

    this.notifySubscribers()
  }

  // 處理欄位 Focus 事件
  handleFieldFocus(fieldName: string): void {
    if (this.eventHandlers.onFieldFocus) {
      this.eventHandlers.onFieldFocus(fieldName)
    }
  }

  // 驗證單一欄位
  validateField(fieldName: string): void {
    const fieldConfig = this.config.find(field => field.name === fieldName)
    if (!fieldConfig) return

    const value = this.currentValues[fieldName]
    const result = ValidationEngine.validateField(value, fieldConfig.rules)
    
    this.errors[fieldName] = result.errors
    this.updateFormValidity()
  }

  // 驗證整個表單
  validateForm(): void {
    const validationResults = ValidationEngine.validateForm(this.currentValues, this.config)
    
    Object.entries(validationResults).forEach(([fieldName, result]) => {
      this.errors[fieldName] = result.errors
    })

    this.updateFormValidity()
    this.notifySubscribers()
  }

  // 更新表單有效性
  private updateFormValidity(): void {
    this.isValid = Object.values(this.errors).every(errors => errors.length === 0)
  }

  // 處理表單提交
  async handleSubmit(event?: React.FormEvent): Promise<void> {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    // 設定提交狀態
    this.isSubmitting = true
    this.submitCount += 1
    this.notifySubscribers()

    try {
      // 最終驗證
      if (this.settings.validateOnSubmit) {
        this.validateForm()
        
        if (!this.isValid) {
          // 有驗證錯誤
          if (this.eventHandlers.onError) {
            this.eventHandlers.onError(this.errors)
          }
          return
        }
      }

      // 執行提交處理器
      if (this.eventHandlers.onSubmit) {
        await this.eventHandlers.onSubmit(this.currentValues)
      }

      // 提交成功後的處理
      if (this.settings.resetOnSubmit) {
        this.reset()
      }

    } catch (error) {
      logger.error('Form submission error', { error, formId: this.formId })
      // 可以在這裡處理提交錯誤
    } finally {
      this.isSubmitting = false
      this.notifySubscribers()
    }
  }

  // 重置表單
  reset(values: Record<string, unknown> = this.initialValues): void {
    this.currentValues = { ...values }
    this.initialValues = { ...values }
    
    // 重置狀態
    this.config.forEach(field => {
      const fieldName = field.name
      this.errors[fieldName] = []
      this.touched[fieldName] = false
      this.dirty[fieldName] = this.settings.keepDirtyOnReinitialize ? 
        this.dirty[fieldName] : false
    })
    
    this.isSubmitting = false
    this.submitCount = 0
    this.validateForm()
  }

  // 清除表單錯誤
  clearErrors(): void {
    Object.keys(this.errors).forEach(fieldName => {
      this.errors[fieldName] = []
    })
    this.updateFormValidity()
    this.notifySubscribers()
  }

  // 清除特定欄位錯誤
  clearFieldError(fieldName: string): void {
    if (this.errors[fieldName]) {
      this.errors[fieldName] = []
      this.updateFormValidity()
      this.notifySubscribers()
    }
  }

  // 手動設定錯誤
  setFieldError(fieldName: string, error: string): void {
    this.errors[fieldName] = [error]
    this.updateFormValidity()
    this.notifySubscribers()
  }

  // 取得欄位值
  getFieldValue(fieldName: string): unknown {
    return this.currentValues[fieldName]
  }

  // 取得欄位錯誤
  getFieldError(fieldName: string): string | undefined {
    return this.errors[fieldName]?.[0]
  }

  // 檢查欄位是否有錯誤
  hasFieldError(fieldName: string): boolean {
    return !!this.errors[fieldName]?.length
  }

  // 檢查欄位是否被觸摸過
  isFieldTouched(fieldName: string): boolean {
    return !!this.touched[fieldName]
  }

  // 檢查欄位是否為 dirty
  isFieldDirty(fieldName: string): boolean {
    return !!this.dirty[fieldName]
  }

  // 取得所有錯誤
  getAllErrors(): Record<string, string[]> {
    return { ...this.errors }
  }

  // 檢查表單是否正在提交
  getIsSubmitting(): boolean {
    return this.isSubmitting
  }

  // 檢查表單是否有效
  getIsValid(): boolean {
    return this.isValid
  }

  // 取得提交次數
  getSubmitCount(): number {
    return this.submitCount
  }

  // 取得目前的值
  getValues(): Record<string, unknown> {
    return { ...this.currentValues }
  }
}

/**
 * 2. 表單管理器工廠
 */
class FormManager {
  private static instances: Record<string, FormStateTracker> = {}

  // 建立或取得表單實例
  static useForm(
    formId: string,
    configId: string,
    initialValues: Record<string, unknown> = {},
    settings: FormSettings = {},
    eventHandlers: FormEventHandlers = {}
  ): FormStateTracker {
    // 如果實例已存在，更新設定
    if (this.instances[formId]) {
      const instance = this.instances[formId]
      
      // 更新初始值（如果需要）
      if (Object.keys(initialValues).length > 0) {
        instance.reset(initialValues)
      }
      
      return instance
    }

    // 取得表單設定
    const config = FormConfigManager.getFormConfig(configId)
    if (!config) {
      throw new Error(`Form config not found: ${configId}`)
    }

    // 建立新實例
    const instance = new FormStateTracker(
      formId,
      config,
      initialValues,
      settings,
      eventHandlers
    )

    this.instances[formId] = instance
    return instance
  }

  // 移除表單實例
  static removeForm(formId: string): void {
    delete this.instances[formId]
  }

  // 取得所有表單實例
  static getAllForms(): string[] {
    return Object.keys(this.instances)
  }

  // 清除所有表單實例
  static clearAllForms(): void {
    this.instances = {}
  }
}

/**
 * 3. React Hook 整合
 */

export function useForm(
  formId: string,
  configId: string,
  initialValues: Record<string, unknown> = {},
  settings: FormSettings = {},
  eventHandlers: FormEventHandlers = {}
) {
  // 取得或建立表單實例
  const form = FormManager.useForm(
    formId,
    configId,
    initialValues,
    settings,
    eventHandlers
  )

  // 狀態鉤子
  const [snapshot, setSnapshot] = React.useState(form.getSnapshot())

  // 訂閱表單狀態變更
  React.useEffect(() => {
    const unsubscribe = form.subscribe(setSnapshot)
    return unsubscribe
  }, [form])

  // 表單操作方法
  const formActions = {
    // 欄位操作
    setFieldValue: form.setFieldValue.bind(form),
    setValues: form.setValues.bind(form),
    handleFieldBlur: form.handleFieldBlur.bind(form),
    handleFieldFocus: form.handleFieldFocus.bind(form),
    
    // 驗證操作
    validateField: form.validateField.bind(form),
    validateForm: form.validateForm.bind(form),
    
    // 提交操作
    handleSubmit: form.handleSubmit.bind(form),
    
    // 重置操作
    reset: form.reset.bind(form),
    clearErrors: form.clearErrors.bind(form),
    clearFieldError: form.clearFieldError.bind(form),
    setFieldError: form.setFieldError.bind(form),
    
    // 狀態查詢
    getFieldValue: form.getFieldValue.bind(form),
    getFieldError: form.getFieldError.bind(form),
    hasFieldError: form.hasFieldError.bind(form),
    isFieldTouched: form.isFieldTouched.bind(form),
    isFieldDirty: form.isFieldDirty.bind(form),
    getAllErrors: form.getAllErrors.bind(form),
    getIsSubmitting: form.getIsSubmitting.bind(form),
    getIsValid: form.getIsValid.bind(form),
    getSubmitCount: form.getSubmitCount.bind(form),
    getValues: form.getValues.bind(form)
  }

  return {
    ...snapshot,
    ...formActions
  }
}

import React from 'react'

// 匯出主要類別
export { FormStateTracker, FormManager }