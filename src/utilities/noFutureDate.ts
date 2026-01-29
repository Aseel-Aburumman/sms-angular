import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noFutureDate(
    control: AbstractControl
): ValidationErrors | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? { futureDate: true } : null;
}


export function noDateBefore1990(
    control: AbstractControl
): ValidationErrors | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    if (isNaN(selectedDate.getTime())) return null;

    const minDate = new Date(1990, 0, 1);  
    minDate.setHours(0, 0, 0, 0);

    return selectedDate < minDate ? { before1990: true } : null;
}