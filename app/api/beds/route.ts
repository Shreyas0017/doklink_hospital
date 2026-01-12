import { NextRequest, NextResponse } from "next/server";
import { getHospitalDb } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getHospitalDb(session.user.hospitalCode);
    const beds = await db.collection("beds").find({}).toArray();

    // Transform _id to id for frontend
    const transformedBeds = beds.map((bed: any) => ({
      ...bed,
      id: bed._id?.toString(),
      patientId: bed.patientId?.toString(),
    }));

    return NextResponse.json(transformedBeds);
  } catch (error) {
    console.error("Failed to fetch beds:", error);
    return NextResponse.json(
      { error: "Failed to fetch beds" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const db = await getHospitalDb(session.user.hospitalCode);

    // Generate next bed ID (b1, b2, b3...)
    const allBeds = await db.collection("beds")
      .find({}, { projection: { _id: 1 } })
      .toArray();
    
    let nextBedNumber = 1;
    if (allBeds.length > 0) {
      const numericIds = allBeds
        .map(b => {
          const match = b._id.toString().match(/^b(\d+)$/);
          return match ? parseInt(match[1]) : null;
        })
        .filter(id => id !== null);
      
      if (numericIds.length > 0) {
        nextBedNumber = Math.max(...numericIds) + 1;
      }
    }
    const bedId = `b${nextBedNumber}`;

    const bedData = {
      _id: bedId,
      ...body,
      hospitalId: session.user.hospitalId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("beds").insertOne(bedData);

    return NextResponse.json(
      { ...bedData, id: bedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create bed:", error);
    return NextResponse.json(
      { error: "Failed to create bed" },
      { status: 500 }
    );
  }
}
