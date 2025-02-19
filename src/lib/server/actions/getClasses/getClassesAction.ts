"use server";

import { Filters } from "@/lib/client/filterStore";
import { getClassesFn } from "./getClassesFn";
/**
 * This function converts the getClassesFn into an action that can be called from the client
 * @param term  The term to get classes for
 * @param subject  The subject to get classes for
 * @param filters  The filters to apply to the classes
 * @returns  The list of classes that match the query
 */
export async function getClassesAction(
  term: number,
  subject: string,
  filters: Filters
) {
  const res = await getClassesFn(term, subject, filters);
  return res["cursor"];
}
