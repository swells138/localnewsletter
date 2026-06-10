import { NextResponse } from "next/server";

export const redirectAfterPost = (path: string, requestUrl: string) =>
  NextResponse.redirect(new URL(path, requestUrl), { status: 303 });
