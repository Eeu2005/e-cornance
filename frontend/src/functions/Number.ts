import { ref } from "vue";
import type { LocationQueryValue } from "vue-router";

export function assertNumero(
	val: LocationQueryValue | LocationQueryValue[] | undefined,
	defaultNumber: number,
): number {
	if (!val) return defaultNumber;
	if (Array.isArray(val)) return defaultNumber;
	if (Number.isNaN(Number(val))) return defaultNumber;
	
	return Number(val);
}
