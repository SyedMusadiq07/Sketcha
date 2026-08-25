import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { projectName, projectId } = await req.json();
  const user = await currentUser();

  if (!user || !user.emailAddresses[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!projectId || !projectName) {
    return NextResponse.json({ error: "Project Name or ID is required" });
  }

  const result = await db
    .insert(projects)
    .values({
      projectId: projectId,
      projectName: projectName,
      userEmail: user?.primaryEmailAddress?.emailAddress ?? "",
    })
    .returning();

  return NextResponse.json(result[0]);
}
