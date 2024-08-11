import type { ReqTree } from "./mongoClient";

export function check_tree(tree: ReqTree, requisites: string[]) {
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