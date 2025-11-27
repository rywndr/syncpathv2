/**
 * Format a number in rupiah
 * @param amount
 * @returns Formatted currency string (e.g., "Rp 1.000.000")
 */
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Parse rupiah format string back to number.
 * Strips all non-numeric characters and converts to integer.
 * @param value
 * @returns The numeric value
 */
export function parseRupiah(value: string): number {
    const cleaned = value.replace(/[^\d]/g, "");
    return parseInt(cleaned) || 0;
}
