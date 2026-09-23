"use client";

import { useCallback, useState, type FormEvent } from "react";
import {
  expenseFormValuesToInput,
  validateExpenseForm,
  type ExpenseFormErrors,
  type ExpenseFormValues,
} from "@/lib/validation";
import type { ExpenseInput } from "@/lib/types";

interface UseExpenseFormOptions {
  /** Field ids are prefixed with this form id (used to focus the first error). */
  formId: string;
  initialValues: ExpenseFormValues;
  /** Persists the validated values; must throw on failure. */
  onSubmit(input: ExpenseInput): Promise<void>;
}

interface UseExpenseFormResult {
  values: ExpenseFormValues;
  errors: ExpenseFormErrors;
  /** Set when persistence itself failed (as opposed to validation). */
  submitError: string | null;
  isSaving: boolean;
  setValue<K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]): void;
  handleSubmit(event: FormEvent<HTMLFormElement>): void;
}

const FIELD_ORDER: Array<keyof ExpenseFormValues> = [
  "title",
  "amount",
  "category",
  "date",
  "description",
];

/**
 * Owns the expense form lifecycle: values, validation on submit, focus
 * management, and the saving/error states around persistence.
 */
export function useExpenseForm({
  formId,
  initialValues,
  onSubmit,
}: UseExpenseFormOptions): UseExpenseFormResult {
  const [values, setValues] = useState<ExpenseFormValues>(initialValues);
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const setValue = useCallback(
    <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) => {
      setValues((previous) => ({ ...previous, [key]: value }));
      // Clear the field's error as soon as the user edits it again.
      setErrors((previous) => {
        if (!previous[key]) return previous;
        const next = { ...previous };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const focusFirstInvalidField = useCallback(
    (fieldErrors: ExpenseFormErrors) => {
      const firstInvalid = FIELD_ORDER.find((field) => fieldErrors[field]);
      if (!firstInvalid) return;
      document
        .querySelector<HTMLElement>(`#${formId} [name="${firstInvalid}"]`)
        ?.focus();
    },
    [formId],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const fieldErrors = validateExpenseForm(values);
      if (Object.values(fieldErrors).some(Boolean)) {
        setErrors(fieldErrors);
        setSubmitError(null);
        focusFirstInvalidField(fieldErrors);
        return;
      }

      setErrors({});
      setSubmitError(null);
      setIsSaving(true);
      void (async () => {
        try {
          await onSubmit(expenseFormValuesToInput(values));
        } catch (error) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "The expense could not be saved. Please try again.",
          );
        } finally {
          setIsSaving(false);
        }
      })();
    },
    [values, onSubmit, focusFirstInvalidField],
  );

  return { values, errors, submitError, isSaving, setValue, handleSubmit };
}
