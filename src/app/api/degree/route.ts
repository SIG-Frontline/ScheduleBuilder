// Import the sectionsCollection from the mongoClient
import { addQuery } from "@/lib/server/apiUtils";
import { curriculaCollection } from "@/lib/server/mongoClient";
import { NextRequest } from "next/server";

// Define an asynchronous GET function that takes a request object as a parameter
export async function GET(request: NextRequest) {
  // Initialize an empty query object
  const query = {};
  // Extract the search parameters from the url
  const searchParams = request.nextUrl.searchParams;

  // Check if the search parameters include 'degree' and add it to the query
  if (searchParams.has("degree")) {
    addQuery(query, "DEGREE", searchParams.get("degree") as string);
  }
  // Repeat the process for other potential search parameters
  if (searchParams.has("year")) {
    addQuery(query, "YEAR", searchParams.get("year") as string, true);
  }
  if (searchParams.has("major")) {
    addQuery(query, "MAJOR", searchParams.get("major") as string);
  }

  // Initialize cursor variables
  let cursor;
  try {
    // Attempt to get the curricula from the curriculaCollection using the query
    cursor = await curriculaCollection.find(query).toArray();
  } catch (e) {
    // Log the error and return a 500 response if there is an error querying the database
    console.error(e);
    return new Response("Error querying database", { status: 500 });
  }

  // Return a response with the curricula in JSON format
  return new Response(JSON.stringify({ curricula: cursor }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
