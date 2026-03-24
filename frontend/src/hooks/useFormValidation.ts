import { useState, useCallback } from 'react';
import { calculateAgeFromDateString, parseDateInput } from '../utils/passengerRules';

export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: (value: any, values?: Record<string, any>) => string | null;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export interface ValidationErrors {
  [field: string]: string;
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback((field: string, value: any, values: Record<string, any> = {}): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return 'Trường này là bắt buộc';
    }

    // Skip other validations if empty and not required
    if (!value || value.toString().trim() === '') {
      return null;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return 'Định dạng không hợp lệ';
    }

    // Min length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      return `Tối thiểu ${rule.minLength} ký tự`;
    }

    // Max length validation
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return `Tối đa ${rule.maxLength} ký tự`;
    }

    // Min value validation
    if (rule.min !== undefined && Number(value) < rule.min) {
      return `Giá trị tối thiểu là ${rule.min}`;
    }

    // Max value validation
    if (rule.max !== undefined && Number(value) > rule.max) {
      return `Giá trị tối đa là ${rule.max}`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value, values);
      if (customError) return customError;
    }

    return null;
  }, [rules]);

  const validate = useCallback((values: { [key: string]: any }): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, values[field], values);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const validateSingle = useCallback((field: string, value: any): boolean => {
    const error = validateField(field, value, { [field]: value });
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
    return !error;
  }, [validateField]);

  const touch = useCallback((field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validate,
    validateSingle,
    touch,
    clearError,
    clearAllErrors,
    hasError: (field: string) => touched[field] && !!errors[field],
    getError: (field: string) => touched[field] ? errors[field] : undefined
  };
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(0|\+84)[0-9]{9,10}$/,
  idNumber: /^[0-9]{9,12}$/,
  name: /^[a-zA-ZÀ-ỹ\s]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  vietnamesePhone: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
};

// Common validation rules
export const commonRules = {
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: validationPatterns.name,
  },
  email: {
    required: true,
    pattern: validationPatterns.email,
  },
  phone: {
    pattern: validationPatterns.vietnamesePhone,
  },
  idNumber: {
    required: true,
    pattern: validationPatterns.idNumber,
    minLength: 9,
    maxLength: 12,
  },
  idNumberChild: {
    required: true,
    pattern: /^[a-zA-Z0-9]{5,20}$/,
    minLength: 5,
    maxLength: 20,
  },
  dateOfBirth: {
    required: true,
    custom: (value: string) => {
      const now = new Date();
      const date = parseDateInput(value);
      
      if (!date || date > now) {
        return 'Ngày sinh không hợp lệ';
      }
      
      const age = calculateAgeFromDateString(value, now);
      if (age === null) {
        return 'Ngày sinh không hợp lệ';
      }

      if (age < 1) {
        return 'Hành khách phải đủ 1 tuổi';
      }
      
      if (age > 120) {
        return 'Ngày sinh không hợp lệ';
      }
      
      return null;
    }
  }
};
