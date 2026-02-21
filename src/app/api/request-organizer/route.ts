import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.canOrganize) {
            return NextResponse.json(
                { message: "You are already an organizer" },
                { status: 400 }
            );
        }

        if (user.organizerRequestStatus === "PENDING") {
            return NextResponse.json(
                { message: "Request already pending" },
                { status: 400 }
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                organizerRequestStatus: "PENDING",
            },
        });

        return NextResponse.json(
            { message: "Request submitted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Request organizer error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
