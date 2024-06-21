import type { IPlan, IPlanStore } from '../interfaces/Plans';
/**
 * This is a helper function that returns the active plan in the plan store.
 * @param planStoreval the current plan store state
 * @returns {IPlan} the active plan in the plan store
 */
export function getActivePlan(planStoreval: IPlanStore): IPlan {
	return planStoreval.find((p: { active: boolean }) => p.active) as IPlan;
}
