// https://kit.svelte.dev/docs/routing#server
// Import the sectionsCollection from the mongoClient module
import { sectionsCollection } from "@/lib/mongoClient";
import { NextRequest } from "next/server";

// Define an asynchronous GET function that takes a request object as a parameter
export async function GET(request: NextRequest) {
  // Extract the 'page' query parameter from the URL, defaulting to 0 if it's not provided
  let cursor;

  // Define the MongoDB aggregation pipeline
  const pipline = [
    { $unwind: "$TIMES" }, // Unwind the TIMES array to work with each object
    { $group: { _id: "$TIMES.building" } }, // Group by the building field
    { $sort: { _id: 1 } },
    { $project: { _id: 0, building: "$_id" } }, // Project the buildings field
    { $match: { building: { $ne: null } } },
  ];

  const searchParams = request.nextUrl.searchParams;
  if (searchParams.has("term")) {
  }
  console.log(pipline);
  try {
    // Execute the aggregation pipeline against the sectionsCollection
    // Limit the number of output documents to 'termsPerPage'
    // Skip 'termsPerPage' * 'page' documents to implement pagination
    cursor = await sectionsCollection.aggregate(pipline).toArray();
  } catch (e) {
    // If an error occurs, log it to the console and return a 500 response
    console.error(e);
    return new Response("Error querying database", { status: 500 });
  }

  // If the query is successful, return the results as a JSON response
  return new Response(JSON.stringify({ buildings: cursor }), {
    headers: {
      "Content-Type": "application/json", // Set the 'Content-Type' header to 'application/json'
    },
  });
}
