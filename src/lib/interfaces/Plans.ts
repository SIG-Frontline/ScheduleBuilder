interface Course {
	_id: string;
	sections: Section[];
	course: string;
}
interface Section {
	SECTION: string;
	COURSE: string;
	INSTRUCTOR: string;
	TIMES: Meeting[];
	selected: boolean;
}
interface Plan {
	active: boolean;
	courses: Course[];
	term: string;
	id: string;
	name: string;
}
interface Meeting {
	start: string;
	end: string;
	day: string;
	building: string;
	room: string;
}
interface PlanStore {
	plans: Plan[];
	find: (value: (p: Plan) => boolean) => Plan;
}
export type { Plan, PlanStore, Section, Course, Meeting };
