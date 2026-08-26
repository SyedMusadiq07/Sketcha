import { db } from "@/db";
import { WhiteboardData } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectId, elements, files, appState } = body;
        const user = await currentUser()

        if(!user){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        if(!projectId) {
            console.error("DEBUG API ERROR: projectId is missing from body:", body);
            return NextResponse.json({error: "Project info is missing "}, {status: 400})
        }

        const result =  await db.insert(WhiteboardData).values( {
            projectId,
            elements,
            files,
            appState,
        }).onConflictDoUpdate({
            target: WhiteboardData.projectId,
            set: {
                elements,
                files,
                appState,
                updatedAt: new Date()
            }
        }).returning()

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("DEBUG API DB ERROR:", error);
        return NextResponse.json({error: "Internal Server Error", details: error.message}, {status: 500});
    }
}