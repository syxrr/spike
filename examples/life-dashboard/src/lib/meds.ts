import type { Medication } from "@/lib/types";

export type Dose = { key: string; med: Medication; time: string };

/** Every dose due today, in time order. `key` indexes the day's DoseLog. */
export function todaysDoses(meds: Medication[]): Dose[] {
	return meds
		.flatMap((med) => med.times.map((time) => ({ key: `${med.id}@${time}`, med, time })))
		.sort((a, b) => a.time.localeCompare(b.time));
}
