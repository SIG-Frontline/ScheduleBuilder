"use server";

export async function deletePlan(userId: string, uuid: string) {
  const baseURL = `${process.env.SBCORE_URL}`;
  try {
    await fetch(`${baseURL}/userPlans/${userId}/${uuid}`, {
      method: "Delete",
    });
  } catch (err) {
    console.log("Error deleting plan from backend:", err);
  }
}
