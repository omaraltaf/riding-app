import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id: rideId } = await params;
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if already participating
        const existing = await prisma.rideParticipant.findUnique({
            where: {
                userId_rideId: {
                    userId: user.id,
                    rideId,
                },
            },
        });

        if (existing) {
            // Leave ride
            await prisma.rideParticipant.delete({
                where: { id: existing.id },
            });
            return NextResponse.json({ message: "Left ride successfully", joined: false });
        } else {
            // Join ride
            await prisma.rideParticipant.create({
                data: {
                    userId: user.id,
                    rideId,
                    role: 'MEMBER',
                },
            });
            return NextResponse.json({ message: "Joined ride successfully", joined: true });
        }
    } catch (error) {
        console.error("Join/Leave ride error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
