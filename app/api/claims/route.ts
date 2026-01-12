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
    const db = await getHospitalDb(session.user.hospitalCode);

    // Generate next claim ID (c1, c2, c3...)
    const allClaims = await db.collection("claims")
      .find({}, { projection: { _id: 1 } })
      .toArray();
    
    let nextClaimNumber = 1;
    if (allClaims.length > 0) {
      const numericIds = allClaims
        .map(c => {
          const match = c._id.toString().match(/^c(\d+)$/);
          return match ? parseInt(match[1]) : null;
        })
        .filter(id => id !== null);
      
      if (numericIds.length > 0) {
        nextClaimNumber = Math.max(...numericIds) + 1;
      }
    }
    const claimId = `c${nextClaimNumber}`;

    const claimData = {
      _id: claimId,
      ...body,
      hospitalId: session.user.hospitalId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("claims").insertOne(claimData);

    return NextResponse.json(
      { ...claimData, id: claimId },
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
