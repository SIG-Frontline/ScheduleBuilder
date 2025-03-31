"use server";

export async function getPlans(userId: string) {
  const baseURL = `${process.env.SBCORE_URL}`;
  const plans = await fetch(`${baseURL}/userPlans/${userId}`, {
    method: "GET",
  }).then((res) => {
    if (res.status === 404) {
      console.log("Plan does not exist yet");
      return null;
    }
    return res.json();
  });
  return plans;
}
