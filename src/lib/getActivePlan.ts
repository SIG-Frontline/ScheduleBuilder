import type { Plan, PlanStore } from './interfaces/Plans';

export function getActivePlan(planStoreval: PlanStore): Plan {
	return planStoreval.find((p: { active: boolean }) => p.active) as Plan;
}
