import { CanDeactivateFn } from '@angular/router';

// Preserve the page while a save or an inline catalog dialog is in progress.
export const expenseFormCanDeactivate: CanDeactivateFn<{ canLeave: boolean }> = component => component.canLeave;
