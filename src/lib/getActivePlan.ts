import type { IPlan, IPlanStore } from './interfaces/Plans';

export function getActivePlan(planStoreval: IPlanStore): IPlan {
	return planStoreval.find((p: { active: boolean }) => p.active) as IPlan;
}
