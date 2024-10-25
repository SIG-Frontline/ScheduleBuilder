interface ICourse {
	_id: string;
	sections: ISection[];
	course: string;
	selectedSection: string;
}
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
	courses: ICourse[];
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

interface ScheduleEntry {
	meeting: IMeeting;
	section: ISection;
	width: number;
	offset: number;
	color_idx: number;
}

export function getScheduleEntries(plan: IPlan): ScheduleEntry[] {
	console.log(plan)
	const entries: ScheduleEntry[] = [];
	const dayMeetings: Record<string, ScheduleEntry[]> = {};

	const selectedSections = plan.courses
		.flatMap(course => course.sections)
		.filter(section => section.SECTION === plan.courses.find(c => c.course === section.COURSE)?.selectedSection);

	selectedSections.forEach((section, idx) => {
		section.TIMES.forEach(meeting => {
			const dayKey = meeting.day;
			if (!dayMeetings[dayKey]) dayMeetings[dayKey] = [];

			const entry: ScheduleEntry = {
				meeting,
				section,
				width: 1,
				offset: 0,
				color_idx: idx
			};
			dayMeetings[dayKey].push(entry);
		});
	});
	// Calculate width and offset for each meeting
	Object.values(dayMeetings).forEach(meetingGroup => {
		meetingGroup.sort((a, b) => a.section.CRN.localeCompare(b.section.CRN));
		console.log("ENTER MEETING GROUP")
		console.log(meetingGroup)
		for (let i = 0; i < meetingGroup.length; i++) {
			console.log(`MAIN ITERATE ${i}`)
			console.log(meetingGroup[i])
			const currentMeeting = meetingGroup[i];
			const overlaps = [{idx: i, meeting: currentMeeting}];

			for (let j = 0; j < meetingGroup.length; j++) {
				if (i === j) {
					continue
				}
				console.log(`SUB ITERATE ${i}`)
				const otherMeeting = meetingGroup[j];
				if (isOverlapping(currentMeeting.meeting, otherMeeting.meeting)) {
					console.log(`HIT ${i} on ${j}:`)
					console.log(otherMeeting)
					overlaps.push({idx: j, meeting: otherMeeting});
				} else {
					console.log(`NOT HIT ${i} on ${j}:`)
					console.log(otherMeeting)
				}
			}
			
			console.log(`APPLYING...`)
			// overlaps is already sorted by CRN so we can set order using the index
			const width = overlaps.length <= 1 ? 1 : 1 / overlaps.length;
			overlaps.forEach((overlap, index) => {
				console.log("--------------------")
				console.log(overlap.idx)
				console.log(overlap.meeting)
				console.log(width)
				console.log(index)
				meetingGroup[overlap.idx].width = width;
				meetingGroup[overlap.idx].offset = index;
			});
		}
		entries.push(...meetingGroup);
	});

	return entries;
}

function isOverlapping(a: IMeeting, b: IMeeting): boolean {
	return (
		a.start < b.end &&
		b.start < a.end
	);
}

export type { IPlan, IPlanStore, ISection, ICourse, IMeeting };

