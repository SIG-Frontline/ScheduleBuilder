'use server';

export async function getBackendStatus(): Promise<boolean> {
  const baseURL = `${process.env.SBCORE_URL}`;
  try {
    const res = await fetch(baseURL);
    return res.ok;
  } catch {
    return false;
  }
}
