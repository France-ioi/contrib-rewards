"use server";

import {signIn} from "@/app/lib/auth";

export async function openLoginWindow() {
  await signIn();
}
