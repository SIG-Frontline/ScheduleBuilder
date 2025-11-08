'use server';

export async function getBackendStatus(): Promise<boolean> {
  const baseURL = `${process.env.SBCORE_URL}/status`;
  try {
    const res = await fetch(baseURL);
    return res.ok;
  } catch {
    return false;
  }
}
