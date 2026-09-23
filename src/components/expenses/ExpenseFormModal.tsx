"use client";

import { useCallback, useMemo } from "react";
import { AlertTriangleIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { SelectInput, TextArea, TextInput } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useExpenseForm } from "@/hooks/use-expense-form";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseInput } from "@/lib/types";
import { expenseToFormValues } from "@/lib/validation";
import { useExpenses } from "@/providers/expense-provider";

interface ExpenseFormModalProps {
  open: boolean;
  /** Expense being edited, or null/undefined when creating. */
  expense?: Expense | null;
  onClose(): void;
}

/**
 * Add/edit dialog: wires the form hook to the shared expense store and
 * renders the fields inside a Modal.
 *
 * Acts as a mount gate: the dialog only exists while open, because the form
 * seeds its state from `expense` on mount — staying mounted across close/open
 * would show stale or empty values.
 */
export function ExpenseFormModal({ open, expense, onClose }: ExpenseFormModalProps) {
  if (!open) return null;
  return <ExpenseFormDialog key={expense?.id ?? "new"} expense={expense} onClose={onClose} />;
}

interface ExpenseFormDialogProps {
  /** Expense being edited, or null/undefined when creating. */
  expense?: Expense | null;
  onClose(): void;
}

function ExpenseFormDialog({ expense, onClose }: ExpenseFormDialogProps) {
  const { addExpense, updateExpense } = useExpenses();

  const isEditing = Boolean(expense);
  const formId = isEditing ? "expense-edit-form" : "expense-add-form";
  const initialValues = useMemo(() => expenseToFormValues(expense), [expense]);

  const handleSubmit = useCallback(
    async (input: ExpenseInput) => {
      if (expense) {
        await updateExpense(expense.id, input);
      } else {
        await addExpense(input);
      }
      onClose();
    },
    [expense, addExpense, updateExpense, onClose],
  );

  const form = useExpenseForm({ formId, initialValues, onSubmit: handleSubmit });
  const { values, errors, submitError, isSaving, setValue, handleSubmit: onSubmit } = form;

  return (
    <Modal
      open
      onClose={onClose}
      busy={isSaving}
      title={isEditing ? "Edit expense" : "Add expense"}
      description={
        isEditing
          ? "Update the details of this transaction."
          : "Record a new transaction in your ledger."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={isSaving}>
            {isEditing ? "Save changes" : "Add expense"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="space-y-4">
        {submitError ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
            {submitError}
          </p>
        ) : null}

        <FormField label="Title" htmlFor={`${formId}-title`} required error={errors.title}>
          <TextInput
            id={`${formId}-title`}
            name="title"
            value={values.title}
            onChange={(event) => setValue("title", event.target.value)}
            placeholder="e.g. Grocery run"
            autoComplete="off"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? `${formId}-title-error` : undefined}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Amount" htmlFor={`${formId}-amount`} required error={errors.amount}>
            <TextInput
              id={`${formId}-amount`}
              name="amount"
              value={values.amount}
              onChange={(event) => setValue("amount", event.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              autoComplete="off"
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? `${formId}-amount-error` : undefined}
            />
          </FormField>

          <FormField label="Date" htmlFor={`${formId}-date`} required error={errors.date}>
            <TextInput
              id={`${formId}-date`}
              name="date"
              type="date"
              value={values.date}
              onChange={(event) => setValue("date", event.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? `${formId}-date-error` : undefined}
            />
          </FormField>
        </div>

        <FormField label="Category" htmlFor={`${formId}-category`} required error={errors.category}>
          <SelectInput
            id={`${formId}-category`}
            name="category"
            value={values.category}
            onChange={(event) =>
              setValue("category", event.target.value as ExpenseInput["category"] | "")
            }
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? `${formId}-category-error` : undefined}
          >
            <option value="">Select a category</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField
          label="Description"
          htmlFor={`${formId}-description`}
          error={errors.description}
          hint="Optional context for this expense."
        >
          <TextArea
            id={`${formId}-description`}
            name="description"
            rows={3}
            value={values.description}
            onChange={(event) => setValue("description", event.target.value)}
            placeholder="e.g. Weekly groceries and household supplies"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? `${formId}-description-error` : `${formId}-description-hint`
            }
          />
        </FormField>
      </form>
    </Modal>
  );
}
