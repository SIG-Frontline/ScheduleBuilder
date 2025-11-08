'use server';

export async function deletePlan(token: string, uuid: string) {
  const baseURL = `${process.env.SBCORE_URL}`;
  try {
    await fetch(`${baseURL}/userPlans/${uuid}`, {
      method: 'Delete',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.log('Error deleting plan from backend:', err);
  }
}
