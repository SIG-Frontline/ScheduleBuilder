import mongodb from 'mongodb';
import { SCHEDULEBUILDER_DB_URI, BUILDER_NS } from '$env/static/private';
if (!SCHEDULEBUILDER_DB_URI) {
	throw new Error('Missing env variable SCHEDULEBUILDER_DB_URI');
}
export const client = new mongodb.MongoClient(SCHEDULEBUILDER_DB_URI);
await client.connect(); //top level await
export const sectionsCollection = client.db(BUILDER_NS).collection('Sections');
export const coursesCollection = client.db(BUILDER_NS).collection('Course_Static');
