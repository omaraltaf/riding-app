import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, bio, location, phone, bike, image } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email! },
            data: {
                name,
                bio,
                location,
                phone,
                bike,
                image,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
