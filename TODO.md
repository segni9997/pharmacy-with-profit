# TODO: Add Delete Functionality to Sold Medicines Page

## Updated Plan:
- Use toast.custom for deletion confirmation instead of a Dialog.
- Add delete button with Trash icon in Actions column.
- Use existing useDeleteSaleMutation.
- Handle success/error with toasts and refetch.

## Steps:

- [x] Step 1: Import necessary components and hooks in src/pos/sold-medicines.tsx (Trash icon, useDeleteSaleMutation, toast)
- [x] Step 2: Add the useDeleteSaleMutation hook
- [x] Step 3: Implement the delete handler function using toast.custom for confirmation, with Yes/No buttons
- [x] Step 4: On confirm, call the mutation, handle success (toast success, refetch), error (toast error)
- [x] Step 5: Add the delete button (with Trash icon) to the Actions column in the table row
- [x] Step 6: Update TODO.md to mark Step 1-5 as complete after implementation
- [x] Step 7: Test the delete functionality and verify table updates
- [x] Step 8: Finalize and complete the task
