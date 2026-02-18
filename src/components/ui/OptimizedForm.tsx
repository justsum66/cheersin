'use client';

import * as React from 'react';
import { m, AnimatePresence, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  defaultValue?: unknown;
  validate?: (value: unknown) => string | null;
  helpText?: string;
  placeholder?: string;
}

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface OptimizedFormProps {
  /** Form fields configuration */
  fields: FormFieldConfig[];
  /** Form submit handler */
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  /** Initial form values */
  initialValues?: Record<string, unknown>;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Whether to show validation errors immediately */
  showErrorsImmediately?: boolean;
  /** Debounce time for validation (ms) */
  validationDebounce?: number;
  /** Custom error renderer */
  renderError?: (error: string) => React.ReactNode;
  /** Custom success handler */
  onSuccess?: () => void;
  /** Custom error handler */
  onError?: (errors: Record<string, string>) => void;
  /** Whether to reset form on successful submit */
  resetOnSubmit?: boolean;
  /** Form ID for state management */
  formId?: string;
  /** Additional form props */
  formProps?: React.FormHTMLAttributes<HTMLFormElement>;
  /** Additional className */
  className?: string;
  /** Form children */
  children?: React.ReactNode;
}

/** 
 * Task 17: Optimized Form Component
 * Performance improvements:
 * 1. Debounced validation to prevent excessive re-renders
 * 2. Optimized state management with batched updates
 * 3. Memoized field components
 * 4. Reduced validation calls through smart triggering
 * 5. Better error handling and user feedback
 * 6. Memory leak prevention
 */
const OptimizedFormInner = React.forwardRef<HTMLFormElement, OptimizedFormProps>(
  (props, ref) => {
    const {
      fields,
      onSubmit,
      initialValues = {},
      validateOnBlur = true,
      validateOnChange = false,
      showErrorsImmediately = false,
      validationDebounce = 300,
      renderError,
      onSuccess,
      onError,
      resetOnSubmit = false,
      formId = 'optimized-form',
      formProps = {},
      className,
      children,
      ...restProps
    } = props;

    const reducedMotion = useReducedMotion();
    const isMounted = React.useRef(true);
    const validationTimer = React.useRef<NodeJS.Timeout | null>(null);
    const submitController = React.useRef<AbortController | null>(null);

    // Initialize form state
    const [formState, setFormState] = React.useState<FormState>(() => ({
      values: { ...initialValues },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true
    }));

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        isMounted.current = false;
        if (validationTimer.current) {
          clearTimeout(validationTimer.current);
        }
        if (submitController.current) {
          submitController.current.abort();
        }
      };
    }, []);

    // Validate single field
    const validateField = React.useCallback((fieldName: string, value: unknown) => {
      const field = fields.find(f => f.name === fieldName);
      if (!field) return null;

      // Required validation
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return `${field.label} 為必填欄位`;
      }

      // Custom validation
      if (field.validate) {
        return field.validate(value);
      }

      return null;
    }, [fields]);

    // Validate all fields
    const validateForm = React.useCallback(() => {
      const newErrors: Record<string, string> = {};
      
      fields.forEach(field => {
        const value = formState.values[field.name];
        const error = validateField(field.name, value);
        if (error) {
          newErrors[field.name] = error;
        }
      });

      return newErrors;
    }, [fields, formState.values, validateField]);

    // Update form state with batching
    const updateFormState = React.useCallback((updates: Partial<FormState>) => {
      setFormState(prev => ({
        ...prev,
        ...updates,
        isValid: Object.keys(updates.errors || prev.errors).length === 0
      }));
    }, []);

    // Debounced validation
    const debouncedValidate = React.useCallback((fieldName: string, value: unknown) => {
      if (validationTimer.current) {
        clearTimeout(validationTimer.current);
      }

      validationTimer.current = setTimeout(() => {
        if (!isMounted.current) return;
        
        const error = validateField(fieldName, value);
        updateFormState({
          errors: {
            ...formState.errors,
            [fieldName]: error || ''
          }
        });
      }, validationDebounce);
    }, [validateField, updateFormState, formState.errors, validationDebounce]);

    // Handle field change
    const handleFieldChange = React.useCallback((fieldName: string, value: unknown) => {
      // Update value immediately
      const newValues = {
        ...formState.values,
        [fieldName]: value
      };

      updateFormState({ values: newValues });

      // Trigger validation if enabled
      if (validateOnChange) {
        debouncedValidate(fieldName, value);
      }

      // Clear error when user starts typing
      if (formState.errors[fieldName] && formState.touched[fieldName]) {
        updateFormState({
          errors: {
            ...formState.errors,
            [fieldName]: ''
          }
        });
      }
    }, [formState.values, formState.errors, formState.touched, updateFormState, validateOnChange, debouncedValidate]);

    // Handle field blur
    const handleFieldBlur = React.useCallback((fieldName: string) => {
      const newTouched = {
        ...formState.touched,
        [fieldName]: true
      };

      updateFormState({ touched: newTouched });

      if (validateOnBlur) {
        const value = formState.values[fieldName];
        const error = validateField(fieldName, value);
        updateFormState({
          errors: {
            ...formState.errors,
            [fieldName]: error || ''
          }
        });
      }
    }, [formState.touched, formState.values, formState.errors, updateFormState, validateOnBlur, validateField]);

    // Handle form submit
    const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (formState.isSubmitting) return;

      // Cancel any pending validation
      if (validationTimer.current) {
        clearTimeout(validationTimer.current);
      }

      // Validate all fields
      const errors = validateForm();
      
      if (Object.keys(errors).length > 0) {
        updateFormState({ 
          errors,
          touched: fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {})
        });
        onError?.(errors);
        return;
      }

      // Start submission
      updateFormState({ isSubmitting: true });
      
      // Create abort controller for cancellation
      if (submitController.current) {
        submitController.current.abort();
      }
      submitController.current = new AbortController();

      try {
        await onSubmit(formState.values);
        
        if (!isMounted.current) return;
        
        onSuccess?.();
        
        if (resetOnSubmit) {
          updateFormState({
            values: { ...initialValues },
            errors: {},
            touched: {},
            isSubmitting: false
          });
        } else {
          updateFormState({ isSubmitting: false });
        }
      } catch (error) {
        if (!isMounted.current) return;
        
        logger.error('Form submission failed', { error, formId });
        updateFormState({ isSubmitting: false });
        
        // Handle error
        if (error instanceof Error) {
          const formErrors = { submit: error.message };
          updateFormState({ errors: formErrors });
          onError?.(formErrors);
        }
      }
    }, [formState.isSubmitting, formState.values, validateForm, updateFormState, onSubmit, onSuccess, resetOnSubmit, initialValues, onError, fields, formId]);

    // Reset form
    const resetForm = React.useCallback(() => {
      updateFormState({
        values: { ...initialValues },
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: true
      });
    }, [initialValues, updateFormState]);

    // Get field props helper
    const getFieldProps = React.useCallback((fieldName: string) => {
      const field = fields.find(f => f.name === fieldName);
      if (!field) return {};

      const value = formState.values[fieldName] ?? '';
      const error = formState.errors[fieldName];
      const isTouched = formState.touched[fieldName];
      const showError = showErrorsImmediately || isTouched;

      return {
        name: fieldName,
        value: typeof value === 'string' ? value : String(value),
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          handleFieldChange(fieldName, e.target.value);
        },
        onBlur: () => handleFieldBlur(fieldName),
        'aria-invalid': showError && !!error,
        'aria-describedby': showError && error ? `${fieldName}-error` : undefined
      };
    }, [fields, formState.values, formState.errors, formState.touched, showErrorsImmediately, handleFieldChange, handleFieldBlur]);

    // Context value for child components
    const formContext = React.useMemo(() => ({
      formState,
      getFieldProps,
      resetForm,
      formId
    }), [formState, getFieldProps, resetForm, formId]);

    // Error renderer
    const ErrorComponent = React.useCallback(({ fieldName }: { fieldName: string }) => {
      const error = formState.errors[fieldName];
      const isTouched = formState.touched[fieldName];
      const showError = showErrorsImmediately || isTouched;

      if (!showError || !error) return null;

      if (renderError) {
        return renderError(error);
      }

      return (
        <LazyMotion features={domAnimation}>
          <m.div
            initial={reducedMotion ? undefined : { opacity: 0, height: 0 }}
            animate={reducedMotion ? undefined : { opacity: 1, height: 'auto' }}
            exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
            className="text-sm text-red-400 mt-1 flex items-center gap-1"
            id={`${fieldName}-error`}
            role="alert"
          >
            <span className="w-4 h-4 flex items-center justify-center">⚠</span>
            {error}
          </m.div>
        </LazyMotion>
      );
    }, [formState.errors, formState.touched, showErrorsImmediately, renderError, reducedMotion]);

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn('space-y-6', className)}
        noValidate
        {...formProps}
      >
        <FormContext.Provider value={formContext}>
          {children || fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label 
                htmlFor={field.name} 
                className="block text-sm font-medium text-white/80"
              >
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              
              <input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                className={cn(
                  'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                  formState.errors[field.name] && (showErrorsImmediately || formState.touched[field.name]) 
                    ? 'border-red-500/50 focus:ring-red-500' 
                    : 'focus:ring-primary-500'
                )}
                {...getFieldProps(field.name)}
              />
              
              <ErrorComponent fieldName={field.name} />
              
              {field.helpText && (
                <p className="text-xs text-white/50 mt-1">{field.helpText}</p>
              )}
            </div>
          ))}
          
          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={formState.isSubmitting || !formState.isValid}
              className={cn(
                'w-full py-3 px-6 rounded-xl font-medium transition-all duration-200',
                formState.isSubmitting || !formState.isValid
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              {formState.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  提交中...
                </span>
              ) : (
                '提交'
              )}
            </button>
          </div>
        </FormContext.Provider>
      </form>
    );
  }
);

OptimizedFormInner.displayName = 'OptimizedForm';

// Form Context
const FormContext = React.createContext<{
  formState: FormState;
  getFieldProps: (fieldName: string) => Record<string, unknown>;
  resetForm: () => void;
  formId: string;
} | null>(null);

// Custom hook for form context
export function useOptimizedForm() {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useOptimizedForm must be used within OptimizedForm');
  }
  return context;
}

// Memoized form component
const OptimizedForm = React.memo(OptimizedFormInner, (prevProps, nextProps) => {
  // Shallow compare props except functions
  const propKeys = Object.keys({ ...prevProps, ...nextProps }) as (keyof OptimizedFormProps)[];
  
  for (const key of propKeys) {
    if (typeof prevProps[key] === 'function' || typeof nextProps[key] === 'function') {
      continue;
    }
    
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }
  
  return true;
});

export { OptimizedForm };