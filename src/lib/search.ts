export async function searchCourses(searchval: string, term: string, filters: string) {
    let query = searchval.replace(/\s/g, ''); // remove spaces from the query
    query = query.replace(/([a-zA-Z])([0-9])/gi, '$1 $2'); // add a space between the course letters and numbers
    let courseSearch = await fetch(
        'http://localhost:5173/api/courses?course=sub!' + query + '&term=str!' + term + '&' + filters
    )
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            const coursearr = data.courses;
            return coursearr.map((course: any) => {
                return {
                    label: course._id,
                    value: course._id,
                    meta: course.sections
                };
            });
        });
    return courseSearch
}