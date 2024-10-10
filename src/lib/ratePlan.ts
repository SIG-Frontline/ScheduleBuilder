import type { IPlan } from './interfaces/Plans';

// Converts a Date to time in minutes since midnight
function convertToMinutes(time: Date) : number {
	return time.getHours() * 60 + time.getMinutes();
}

// Converts the NJIT day scheme to an index (0 = Sunday)
function convertDayToIndex(day: string) : number {
	switch (day) {
		case 'U':
			return 0;
		case 'M':
			return 1;
		case 'T':
			return 2;
		case 'W':
			return 3;
		case 'R':
			return 4;
		case 'F':
			return 5;
		case 'S':
			return 6;
		default:
			return -1;
	}
}

// Returns the amount of minutes a plan would spend on campus
// "On campus" being from the start of the first class to the end of the last class on a given day
export function ratePlan(plan: IPlan, isCommute: boolean) : number {

	//Commute option needs to be intergrated into frontend
	
	const earliestStart = [1440, 1440, 1440, 1440, 1440, 1440, 1440]; // 60 minutes * 24 hours = 1440 minutes
	const latestEnd = [0, 0, 0, 0, 0, 0, 0];
	
	for(const course of plan.courses) {
		let section;

		// Gets the selected section for that course
		for(const s of course.sections) {
			if(s.SECTION == course.selectedSection) section = s;
		}
		if(!section) continue;

		// Loops through each meeting of that day
		for(const meeting of section.TIMES) {
			// Gets the start and end time and sees if it earlier/later than our currently stored start/end time for that day
			const start = convertToMinutes(new Date(meeting.start));	
			const end = convertToMinutes(new Date(meeting.end));

			const index = convertDayToIndex(meeting.day);			

			earliestStart[index] = Math.min(earliestStart[index], start);
			latestEnd[index] = Math.max(latestEnd[index], end);
		}
	}

	// Adds together the "time on campus" for a metric on how "good" the class is
	let timeOnCampus = 0;
	
	for (let i = 0; i < 7; i++) {
		const diff = latestEnd[i] - earliestStart[i];
		if(diff < 0) continue; // No classes on that day
	
		timeOnCampus += diff;

		//Compensate for Commute time
		if (isCommute){
			timeOnCampus += (3*60);
		}
	}
	
	return timeOnCampus;
}
