import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Retry helper for Neon cold-start failures ("fetch failed")
async function withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    delayMs = 1000
): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const isNetworkError =
                err?.message?.includes("fetch failed") ||
                err?.message?.includes("Error connecting to database");

            if (!isNetworkError || attempt === maxAttempts) {
                throw err;
            }

            console.warn(
                `[DB] Attempt ${attempt} failed (Neon cold start?). Retrying in ${delayMs}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            delayMs *= 2; // exponential backoff
        }
    }
    throw lastError;
}

export async function POST(req: NextRequest) {
    const user = await currentUser();

    if (user) {
        try {
            const userData = await withRetry(() =>
                db
                    .select()
                    .from(users)
                    .where(
                        eq(
                            users.email,
                            user.primaryEmailAddress?.emailAddress ?? ""
                        )
                    )
            );

            if (userData?.length > 0) {
                return NextResponse.json(userData[0]);
            } else {
                const result = await withRetry(() =>
                    db
                        .insert(users)
                        .values({
                            name: user?.fullName,
                            email:
                                user?.primaryEmailAddress?.emailAddress ?? "",
                        })
                        .returning()
                );
                return NextResponse.json(result[0]);
            }
        } catch (error) {
            console.error("Database Error:", error);
            return NextResponse.json(
                { error: "Failed to interact with the database" },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({ message: "User not found" }, { status: 404 });
}