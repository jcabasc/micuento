"use server";

import { verifyAdminPassword, createAdminSession } from "@/lib/admin-auth";

export async function loginAdmin(
  password: string
): Promise<{ success: boolean; error?: string }> {
  const isValid = await verifyAdminPassword(password);

  if (!isValid) {
    return { success: false, error: "Contraseña incorrecta" };
  }

  await createAdminSession();
  return { success: true };
}
