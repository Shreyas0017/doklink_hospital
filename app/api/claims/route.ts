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

    const db = await getHospitalDb(session.user.hospitalId);
    const claims = await db.collection("claims").find({}).toArray();

    // Transform _id to id for frontend
    const transformedClaims = claims.map((claim: any) => ({
      ...claim,
      id: claim._id?.toString(),
      patientId: claim.patientId?.toString(),
    }));

    return NextResponse.json(transformedClaims);
  } catch (error) {
    console.error("Failed to fetch claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
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
    const db = await getHospitalDb(session.user.hospitalId);

    const claimData = {
      ...body,
      hospitalId: new ObjectId(session.user.hospitalId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("claims").insertOne(claimData);

    return NextResponse.json(
      { ...claimData, id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create claim:", error);
    return NextResponse.json(
      { error: "Failed to create claim" },
      { status: 500 }
    );
  }
}
