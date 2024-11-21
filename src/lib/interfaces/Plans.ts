/*interface ICourse {
	_id: string;
	sections: ISection[];
	course: string;
	selectedSection: string;
}*/
interface ISection {
	SECTION: string;
	COURSE: string;
	INSTRUCTOR: string;
	TIMES: IMeeting[];
	selected: boolean;
	NOW: number;
	MAX: number;
	TITLE: string;
	CRN: string;
}
interface IPlan {
	active: boolean;
	sections: ISection[];
	term: string;
	id: string;
	name: string;
}
interface IMeeting {
	start: string;
	end: string;
	day: string;
	building: string;
	room: string;
}
interface IPlanStore {
	plans: IPlan[];
	find: (value: (p: IPlan) => boolean) => IPlan;
}
export type { IPlan, IPlanStore, ISection, IMeeting };
