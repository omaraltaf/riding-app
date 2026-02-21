import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ride = await prisma.ride.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                itinerary: {
                    orderBy: { order: 'asc' }
                }
            },
        });

        if (!ride) {
            return NextResponse.json({ message: "Ride not found" }, { status: 404 });
        }

        return NextResponse.json(ride);
    } catch (error) {
        console.error("Get ride error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// Update ride (Organizer or Admin only)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
        });

        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const existingRide = await prisma.ride.findUnique({
            where: { id },
            include: { participants: true }
        });

        if (!existingRide) return NextResponse.json({ message: "Ride not found" }, { status: 404 });

        const isOrganizer = existingRide.participants.some(p => p.userId === user.id && p.role === 'ORGANIZER');
        if (!isOrganizer && user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const updatedRide = await prisma.ride.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                date: body.date ? new Date(body.date) : undefined,
                startLocation: body.startLocation,
                endLocation: body.endLocation,
                visibility: body.visibility,
            }
        });

        return NextResponse.json(updatedRide);
    } catch (error) {
        console.error("Update ride error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// Cancel/Delete ride (Organizer or Admin only)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
        });

        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const existingRide = await prisma.ride.findUnique({
            where: { id },
            include: { participants: true }
        });

        if (!existingRide) return NextResponse.json({ message: "Ride not found" }, { status: 404 });

        const isOrganizer = existingRide.participants.some(p => p.userId === user.id && p.role === 'ORGANIZER');
        if (!isOrganizer && user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await prisma.ride.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Ride deleted successfully" });
    } catch (error) {
        console.error("Delete ride error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
