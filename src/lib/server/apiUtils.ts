import { courseCache, type ReqTree } from "./mongoClient";

export type ClassRecommendation = ClassRec | ClassBranch | ClassWild;

export type ClassRec = {
	name?: string; 				// the name of the class
	type: 'class'; 	// the type of this recommendation
	course: string; 			// the course code (CS 100)
	legacy?: boolean; 			// whether this is legacy (no longer available)
}

export type ClassWild = {
	name?: string; 					// the name of the class
	type: 'wildcard'; 	// the type of this recommendation
	course: string; 				// the course code (CS 100)
	legacy?: boolean; 				// whether this is legacy (no longer available)
	credits: number;				// how many credits this wildcard has satisfied (used for parsing)
	courses: number;				// how many courses this wildcard has satisfied (used for parsing)
}

export type ClassBranch = {
	name: string; 						// name of the branch/section/group
	type: 'branch'; 			// the type of this recommendation
	numCredits?: number; 				// how many credits are required
	numClasses?: number; 				// how many classes are required
	operator: '&' | '|'; 				// group operator
	classes: ClassRecommendation[]; 	// the recommendations that belong to this group
}

// FIX: EVERYTHING BELOW THIS IS UNUSED (for the most part)
// Not removing for legacy purposes, once the routes are removed, these can also be removed

export function check_tree(tree: ReqTree, requisites: string[]) {
  if (tree === null || tree === undefined || tree.length <= 0) {
    return true;
  }

  if (typeof tree === "string") return requisites.includes(tree as string);

  const is_and = tree[0] === "&";

  for (let i = 1; i < tree.length; i++) {
    let is_condition_valid = undefined;
    if (typeof tree[i] === "string") {
      is_condition_valid = requisites.includes(tree[i] as string);
    } else {
      is_condition_valid = check_tree(tree[i] as ReqTree, requisites);
    }

    if (is_and && !is_condition_valid) {
      // Check Failed; condition is AND and one of the courses are not present
      return false;
    } else if (!is_and && is_condition_valid) {
      // Check Succeeded; condition is OR and one of the courses is present
      return true;
    }
    // Other cases:
    // - Condition is AND and one of the courses is present; continue
    // - Condition is OR and one of the courses is not present; continue
  }

  // Cases:
  // - is_and == true; We reach the end of the loop if everything is present; return true
  // - is_and == false; We reach the end of the loop if nothing is present; return false
  return is_and;
}

export function convertString(
  input: string
): number | boolean | null | undefined | string {
  console.log("input for convertString is: ");
  console.log(input);
  // Check for undefined
  if (input === "undefined") {
    return undefined;
  }

  // Check for null
  if (input === "null") {
    return null;
  }

  // Check for boolean true/false
  if (input.toLowerCase() === "true") {
    return true;
  }

  if (input.toLowerCase() === "false") {
    return false;
  }

  // Check for number
  const num = parseFloat(input);
  if (!isNaN(num) && isFinite(num)) {
    return num;
  }

  // Return the original string if no conversion was possible
  return input;
}

/**
 *
 * @param query - The query object to add the key-value pair to
 * @param key - The key to add to the query object
 * @param value - The value to add to the query object
 * @param preserveType - Whether to preserve the type of the value
 * @returns
 */
export function addQuery(
  query: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  },
  key: string,
  value: string,
  preserveType?: boolean
) {
  // Queries have a special format to allow for different operations
  // These are split by an '!' character, in the following format: operation!value
  //
  // X - Match this key to X exactly
  // n!X - Match this key to anything except X
  // range!X|Y - Match this key to values in the range [X, Y]
  // nrange!X|Y - Match this key to values not in the range [X, Y]
  // in!X|Y|Z - Match this key to anything in the list X,Y,Z
  // nin!X|Y|Z - Match this key to anything not in the list X,Y,Z
  // sub!X - Match this key to any string containing X
  // nsub!X - Match this key to any string not containing X
  // str!X - Match this key to X exactly without converting X
  // nstr!X - Match this key to anything except X, without converting X
  //
  // Note: We use '|' instead of ',' to separate lists so that we can match professor names more easily
  //
  // api?n!CS 450,in!CS 288|CS 280|CS 114
  console.log("Receiving query: ");
  console.log(query);
  console.log("Receiving key: ");
  console.log(key);
  console.log("Receiving value: ");
  console.log(value);
  console.log("Type of value is: ");
  console.log(typeof value);
  const valueToPreserve = typeof value;
  console.log("Receiving preserveType: ");
  console.log(preserveType);
  if (!value.includes("!")) {
    // Equivalent to str!X
    query[key] = { $eq: preserveType ? value : convertString(value) };
    return;
  }

  const split = value.split("!");
  const operation = split[0];
  const operand = split.slice(1).join("!"); // Reconstruct the operand after splitting

  console.log("The operation is: ");
  console.log(operation);
  console.log("The operand is: ");
  console.log(operand);

  let operands: string[] = [];
  if (operand.includes("|")) {
    operands = operand.split("|");
  } else {
    operands = [operand];
  }

  switch (operation) {
    case "str":
      query[key] = { $eq: operand };
      break;
    case "nstr":
      query[key] = { $ne: operand };
      break;
    case "n":
      query[key] = { $ne: convertString(operand) };
      break;
    case "range":
      query[key] = {
        $gte: convertString(operands[0]),
        $lte: convertString(operands[1]),
      };
      break;
    case "nrange":
      query[key] = {
        $not: {
          $gte: convertString(operands[0]),
          $lte: convertString(operands[1]),
        },
      };
      break;
    case "gte":
      query[key] = { $gte: convertString(operand) };
      break;
    case "lte":
      query[key] = { $lte: convertString(operand) };
      break;
    case "in":
      query[key] = {
        $in: operands.map((op) => op),
      };
      break;
    case "nin":
      // TODO: Make sure this change doesn't break anything :)
      query[key] = {
        $nin: preserveType
          ? operands.map((op) => op)
          : operands.map((op) => convertString(op)),
      };
      break;
    case "sub":
      query[key] = { $regex: `.*${operand}.*`, $options: "i" };
      break;
    case "nsub":
      query[key] = {
        $not: { $regex: `.*${operand}.*`, $options: "i" },
      };
      break;
    default:
      // If operation doesn't match any known operations, treat it as exact match
      query[key] = { $eq: convertString(value) };
      break;
  }
  console.log("query[key]:");
  console.log(query[key]);
}
export async function get_static_data(course: string) {
  let static_courses = await courseCache.getCourses();

  static_courses = static_courses.filter((item) => item._id == course);

  if (static_courses.length < 1) {
    return undefined;
  } else {
    return static_courses[0];
  }
}

export async function check_prereq(course: string, requisites: string[]) {
  const staticData = await get_static_data(course);
  if (staticData === undefined) {
    // Bias true if we can't find static data
    // Shouldn't really happen regardless
    return true;
  }

  return check_tree(staticData.tree, requisites);
}

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addRegexSearch(query: Record<string, any>, key: string, value: string) {
  if (value) {
    query[key] = { $regex: escapeRegex(value), $options: "i" };
  }
}
