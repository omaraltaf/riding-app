import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// List all public rides with optional filtering
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const startLocation = searchParams.get("start");
        const endLocation = searchParams.get("destination");
        const organizer = searchParams.get("organizer");

        const where: any = { visibility: true };

        if (from || to) {
            where.date = {};
            if (from) where.date.gte = new Date(from);
            if (to) where.date.lte = new Date(to);
        }

        if (startLocation) {
            where.startLocation = { contains: startLocation, mode: 'insensitive' };
        }

        if (endLocation) {
            where.endLocation = { contains: endLocation, mode: 'insensitive' };
        }

        if (organizer) {
            where.participants = {
                some: {
                    role: 'ORGANIZER',
                    user: {
                        name: { contains: organizer, mode: 'insensitive' }
                    }
                }
            };
        }

        const rides = await prisma.ride.findMany({
            where,
            include: {
                participants: {
                    include: {
                        user: {
                            select: { name: true, email: true, image: true }
                        }
                    }
                },
                itinerary: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { date: 'asc' }
        });

        return NextResponse.json(rides);
    } catch (error) {
        console.error("List rides error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// Create a new ride
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
        });

        if (!user || (!user.canOrganize && user.role !== 'ADMIN')) {
            return NextResponse.json({ message: "Forbidden - You do not have organizer permissions" }, { status: 403 });
        }

        const { title, description, date, startLocation, endLocation, visibility, itinerary } = await req.json();

        if (!title || !date || !startLocation || !endLocation) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const ride = await prisma.ride.create({
            data: {
                title,
                description,
                date: new Date(date),
                startLocation,
                endLocation,
                visibility: visibility ?? true,
                participants: {
                    create: {
                        userId: user.id,
                        role: 'ORGANIZER',
                    }
                },
                itinerary: {
                    create: itinerary?.map((stop: any, index: number) => ({
                        title: stop.title,
                        description: stop.description,
                        plannedTime: new Date(stop.plannedTime),
                        order: index,
                    }))
                }
            },
            include: {
                itinerary: true,
            }
        });

        return NextResponse.json(ride, { status: 201 });
    } catch (error) {
        console.error("Create ride error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
