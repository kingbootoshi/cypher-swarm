/**
 * Formats a date to dd/mm/yy - HH:MM AM/PM UTC format
 * @param date - Date object or ISO string to format
 * @returns Formatted date string
 */

export function formatTimestamp(date: Date | string): string {
    // Convert input to Date object if it's an ISO string
    let dateObj: Date;
    if (typeof date === 'string') {
        // Append 'Z' if not already present to indicate UTC
        if (!date.endsWith('Z')) {
            date += 'Z';
        }
        dateObj = new Date(date);
    } else {
        dateObj = date;
    }
    
    // Validate date
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        throw new Error('Invalid date input');
    }

    // Extract UTC components
    const day = dateObj.getUTCDate().toString().padStart(2, '0');
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getUTCFullYear().toString().slice(-2);
    
    // Get hours in 12-hour format
    let hours = dateObj.getUTCHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12
    
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} - ${hours}:${minutes} ${ampm} UTC`;
}

/**
 * Returns the current UTC time in formatted string: [dd/mm/yy - HH:MM AM/PM UTC]
 * @returns Formatted current UTC timestamp string with brackets
 */
export function getCurrentTimestamp(): string {
    const now = new Date();
    return `[${formatTimestamp(now)}]`;
}

