// Import the sectionsCollection from the mongoClient
import { sectionsCollection } from "@/lib/mongoClient";
import { NextRequest } from "next/server";
// Define an asynchronous GET function that takes a request object as a parameter
export async function GET(request: NextRequest): Promise<Response> {
  // Extract the 'page' query parameter from the URL, defaulting to 0 if it's not provided
  let cursor;
  const urlParams = new URL(request.url).searchParams;
  const term = urlParams.get("term");
  const pipline = [];
  if (term) {
    pipline.push({ $match: { TERM: term } });
  }
  // Define the MongoDB aggregation pipline
  pipline.push(
    {
      $group: {
        _id: "$SUBJECT", // Group documents by the 'TERM' field
      },
    },
    {
      $project: {
        _id: 0, // Exclude the '_id' field from the output documents
        SUBJECT: "$_id", // Include the 'TERM' field in the output documents
        count: 1, // Include a 'count' field in the output documents
      },
    },
    {
      $sort: {
        SUBJECT: 1, // Sort the output documents in descending order by the 'TERM' field
      },
    }
  );
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
  return new Response(JSON.stringify({ subjects: cursor }), {
    headers: {
      "Content-Type": "application/json", // Set the 'Content-Type' header to 'application/json'
    },
  });
}
