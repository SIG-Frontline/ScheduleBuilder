"use server";

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

export async function encryptArr(arr: string[]) {
  return encrypt(JSON.stringify(arr));
}

export async function decryptArr(cipherText: string): Promise<string[]> {
  const text = await decrypt(cipherText);
  if(!text) return [];
  return JSON.parse(text) as string[];
}

// Encrypts a string using aes-256-gcm
export async function encrypt(text: string) {
  try {
    const key = process.env.ENCRYPT_KEY;
    if (!key) {
		console.error("Encrypt: Invalid encryption");
		return
	}

    const iv = randomBytes(16);
    const cipher = createCipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64'),
      iv,
    );

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('base64') + '.' + encrypted.toString('base64');
  } catch {
	console.error('Invalid input');
	return
  }
}

// Decrypts a string using aes-256-gcm
export async function decrypt(text: string) {
  try {
    const [ivRaw, encryptedRaw] = text.split('.');

    const iv = Buffer.from(ivRaw, 'base64');
    const encryptedText = Buffer.from(encryptedRaw, 'base64');

    const key = process.env.ENCRYPT_KEY;
    if (!key) {
		console.error("Decrypt: Invalid encryption");
		return
	}

    const decipher = createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64'),
      iv,
    );
    const decrypted = decipher.update(encryptedText);

    return decrypted.toString();
  } catch {
	console.error('Invalid input');
	return
  }
}

export async function getTakenCourses(userId: string) {
  const baseURL = `${process.env.SBCORE_URL}`;
  const takenCourses = await fetch(`${baseURL}/settings/courses/${userId}`, {
    method: "GET",
  }).then(async (res) => {
    if (res.status !== 200) {
      console.log("Get: No settings for that user");
      return null;
    }
    return res.text();
  });
  return takenCourses;
}

export async function setTakenCourses(userId: string, courses: string) {
  const baseURL = `${process.env.SBCORE_URL}`;
  await fetch(`${baseURL}/settings/courses/${userId}/${courses}`, {
    method: "POST",
  }).then(async (res) => {
	if (res.status !== 200) console.log("Set: Invalid user/course");
  });
}

