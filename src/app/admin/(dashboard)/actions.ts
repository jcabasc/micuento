"use server";

import { destroyAdminSession } from "@/lib/admin-auth";

export async function logoutAdmin(): Promise<void> {
  await destroyAdminSession();
}
