import { NextResponse } from "next/server";
import { getHospitalDb } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { Activity } from "@/lib/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getHospitalDb(session.user.hospitalCode);
    const activities = await db
      .collection<Activity>("activities")
      .find()
      .sort({ time: -1 })
      .limit(50)
      .toArray();

    const transformedActivities = activities.map((activity: any) => ({
      ...activity,
      id: activity._id?.toString(),
      referenceId: activity.referenceId?.toString(),
    }));

    return NextResponse.json(transformedActivities);
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const db = await getHospitalDb(session.user.hospitalCode);

    // Generate next activity ID (a1, a2, a3...)
    const allActivities = await db.collection("activities")
      .find({}, { projection: { _id: 1 } })
      .toArray();
    
    let nextActivityNumber = 1;
    if (allActivities.length > 0) {
      const numericIds = allActivities
        .map(a => {
          const match = a._id.toString().match(/^a(\d+)$/);
          return match ? parseInt(match[1]) : null;
        })
        .filter(id => id !== null);
      
      if (numericIds.length > 0) {
        nextActivityNumber = Math.max(...numericIds) + 1;
      }
    }
    const activityId = `a${nextActivityNumber}`;

    const activityData = {
      _id: activityId,
      ...body,
      hospitalId: session.user.hospitalId,
      time: new Date(),
      createdAt: new Date(),
    };

    await db.collection("activities").insertOne(activityData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
