"use server";

export async function getPlans(token: string) {
  const baseURL = `${process.env.SBCORE_URL}`;

  const plans = await fetch(`${baseURL}/userPlans`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then((res) => {
    if (res.status === 404) {
      console.log("Plan does not exist yet");
      return [];
    }
    return res.json();
  });
  return plans;
}
