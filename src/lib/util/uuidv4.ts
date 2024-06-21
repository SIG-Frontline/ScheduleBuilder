/**
 * Generate a random UUIDv4 string
 * @returns A random UUIDv4 string
 * @example const uuid = uuidv4(); // '3b8b6f8d-3b8b-4f8d-9f8d-3b8b6f8d3b8b'
 */
export function uuidv4(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
