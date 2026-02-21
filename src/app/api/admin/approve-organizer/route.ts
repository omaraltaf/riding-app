import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Only Admins can approve
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId, status } = await req.json();

        if (!userId || !["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json(
                { message: "Invalid request data" },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                organizerRequestStatus: status,
                canOrganize: status === "APPROVED",
            },
        });

        return NextResponse.json(
            { message: `User status updated to ${status}` },
            { status: 200 }
        );
    } catch (error) {
        console.error("Approve organizer error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
