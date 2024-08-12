import { courseCache, type CourseDocument, type ReqTree } from "./mongoClient";

export function check_tree(tree: ReqTree, requisites: string[]) {
    if (tree === null || tree === undefined || tree.length <= 0) {
        return true
    }
    let is_and = tree[0] === '&'

    for (let i = 1; i < tree.length; i++) {
        let is_condition_valid = undefined
        if (typeof tree[i] === 'string') {
            is_condition_valid = requisites.includes(tree[i] as string)
        } else {
            is_condition_valid = check_tree(tree[i] as ReqTree, requisites)
        }

        if (is_and && !is_condition_valid) {
            // Check Failed; condition is AND and one of the courses are not present
            return false
        }
        else if (!is_and && is_condition_valid) {
            // Check Succeeded; condition is OR and one of the courses is present
            return true
        }
        // Other cases:
        // - Condition is AND and one of the courses is present; continue
        // - Condition is OR and one of the courses is not present; continue
    }

    // Cases:
    // - is_and == true; We reach the end of the loop if everything is present; return true
    // - is_and == false; We reach the end of the loop if nothing is present; return false
    return is_and
}

export function convertString(input: string): number | boolean | null | undefined | string {
    // Check for undefined
    if (input === 'undefined') {
        return undefined;
    }

    // Check for null
    if (input === 'null') {
        return null;
    }

    // Check for boolean true/false
    if (input.toLowerCase() === 'true') {
        return true;
    }

    if (input.toLowerCase() === 'false') {
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

export function addQuery(
    query: {
        [key: string]: any;
    },
    key: string,
    value: string
) {
    // Queries have a special format to allow for different operations
    // These are split by an '!' character, in the following format: operation!value
    //
    // X - Match this key to X exactly
    // n!X - Match this key to anything except X
    // range!X|Y - Match this key to values in the range [X, Y]
    // nrange!X|Y - Match this key to values not in the range [X, Y]
    // in!X|Y|Z - Match this key to anything in the range X,Y,Z
    // nin!X|Y|Z - Match this key to anything not in the range X,Y,Z
    // sub!X - Match this key to any string containing X
    // nsub!X - Match this key to any string not containing X
    // str!X - Match this key to X exactly without converting X
    // nstr!X - Match this key to anything except X, without converting X
    //
    // Note: We use '|' instead of ',' to separate lists so that we can match professor names more easily 

    if (!value.includes('!')) {
        // Equivalent to str!X
        query[key] = { $eq: convertString(value) };
        return;
    }

    let split = value.split('!');
    const operation = split[0];
    let operand = split.slice(1).join('!'); // Reconstruct the operand after splitting

    let operands: string[] = [];
    if (operand.includes('|')) {
        operands = operand.split('|');
    } else {
        operands = [operand];
    }

    switch (operation) {
        case 'str':
            query[key] = {$eq: operand}
            break;
        case 'nstr':
            query[key] = {$ne: operand}
            break;
        case 'n':
            query[key] = { $ne: convertString(operand) };
            break;
        case 'range':
            query[key] = {
                $gte: convertString(operands[0]),
                $lte: convertString(operands[1])
            };
            break;
        case 'nrange':
            query[key] = {
                $not: {
                    $gte: convertString(operands[0]),
                    $lte: convertString(operands[1])
                }
            };
            break;
        case 'in':
            query[key] = {
                $in: operands.map(op => convertString(op))
            };
            break;
        case 'nin':
            query[key] = {
                $nin: operands.map(op => convertString(op))
            };
            break;
        case 'sub':
            query[key] = { $regex: `.*${operand}.*`, $options: 'i' };
            break;
        case 'nsub':
            query[key] = {
                $not: { $regex: `.*${operand}.*`, $options: 'i' }
            };
            break;
        default:
            // If operation doesn't match any known operations, treat it as exact match
            query[key] = { $eq: convertString(value) };
            break;
    }
}
export async function get_static_data(course: string) {
    let static_courses = await courseCache.getCourses()
    
    static_courses = static_courses.filter((item) => item._id == course)
    
    if (static_courses.length < 1) {
        return undefined
    }
    else {
        return static_courses[0]
    }
}

export async function check_prereq(course: string, requisites: string[]) {
    let staticData = await get_static_data(course)
    if (staticData === undefined) {
        // Bias true if we can't find static data
        // Shouldn't really happen regardless
        return true
    }
    
    return check_tree(staticData.tree, requisites)
}