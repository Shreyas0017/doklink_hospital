"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import {
  Bed as BedIcon,
  Users,
  UserCheck,
  UserMinus,
  FileText,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ================= TYPES ================= */

type BedStatus = "available" | "occupied" | "maintenance";
type PatientStatus = "Admitted" | "Discharged";
type ClaimStatus = "Pending" | "Approved" | "Rejected" | "Partial";

interface Bed {
  id: string;
  bedNumber: string;
  ward: string;
  status: BedStatus;
}

interface Patient {
  id: string;
  name: string;
  diagnosis: string;
  admissionDate: string | Date;
  status: PatientStatus;
  assignedBed?: string;
}

interface Claim {
  id: string;
  status: ClaimStatus;
}

interface Activity {
  id: string;
  type: "admission" | "discharge" | "claim";
  description: string;
  time: string | Date;
}

/* ================= COMPONENT ================= */

export default function Dashboard() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    async function fetchData() {
      try {
        const [bedsRes, patientsRes, claimsRes, activitiesRes] =
          await Promise.all([
            fetch("/api/beds"),
            fetch("/api/patients"),
            fetch("/api/claims"),
            fetch("/api/activities"),
          ]);

        const bedsData = (await bedsRes.json()).map((b: any) => ({
          ...b,
          id: b._id,
        }));

        const patientsData = (await patientsRes.json()).map((p: any) => ({
          ...p,
          id: p._id,
        }));

        const claimsData = (await claimsRes.json()).map((c: any) => ({
          ...c,
          id: c._id,
        }));

        const activitiesData = (await activitiesRes.json()).map((a: any) => ({
          ...a,
          id: a._id,
        }));

        setBeds(bedsData);
        setPatients(patientsData);
        setClaims(claimsData);
        setActivities(activitiesData);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-lg">Loading dashboard...</div>;
  }

  /* ================= STATS ================= */

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === "occupied").length;
  const availableBeds = beds.filter(b => b.status === "available").length;

  const totalPatients = patients.length;
  const activeClaims = claims.filter(c => c.status !== "Approved").length;

  const currentPatients = patients
    .filter(p => p.status === "Admitted")
    .slice(0, 5);

  /* ================= WEEKLY DATA (TEMP) ================= */

  const today = new Date();
  const weekDays = eachDayOfInterval({
    start: startOfWeek(today, { weekStartsOn: 1 }),
    end: endOfWeek(today, { weekStartsOn: 1 }),
  });

  const weeklyData = weekDays.map(day => ({
    day: format(day, "EEE"),
    admissions: Math.floor(Math.random() * 10) + 5,
    discharges: Math.floor(Math.random() * 8) + 3,
  }));

  const maxValue = Math.max(
    ...weeklyData.flatMap(d => [d.admissions, d.discharges])
  );

  /* ================= UI ================= */

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Hospital Dashboard</h1>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        <StatCard title="Total Beds" value={totalBeds} icon={<BedIcon />} />
        <StatCard title="Occupied Beds" value={occupiedBeds} icon={<UserCheck />} />
        <StatCard title="Available Beds" value={availableBeds} icon={<BedIcon />} />
        <StatCard title="Patients" value={totalPatients} icon={<Users />} />
        <StatCard title="Active Claims" value={activeClaims} icon={<FileText />} />
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ===== BEDS ===== */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bed Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {["General", "ICU", "Pediatric", "Maternity", "Emergency"].map(ward => {
              const wardBeds = beds.filter(b => b.ward === ward);
              return (
                <div key={ward}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{ward}</span>
                    <span className="text-sm text-gray-500">
                      {wardBeds.filter(b => b.status === "occupied").length}/
                      {wardBeds.length}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {wardBeds.map(bed => (
                      <Link
                        key={bed.id}
                        href="/beds"
                        className={`w-10 h-10 flex items-center justify-center rounded text-xs font-medium
                          ${
                            bed.status === "available"
                              ? "bg-green-200"
                              : bed.status === "occupied"
                              ? "bg-red-200"
                              : "bg-yellow-200"
                          }`}
                      >
                        {bed.bedNumber.split("-")[1]}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ===== ACTIVITY ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.slice(0, 6).map(activity => (
              <div key={activity.id} className="text-sm">
                <p className="font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(activity.time), "PPp")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ===== CURRENT PATIENTS ===== */}
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Current Patients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentPatients.map(p => (
              <Link
                key={p.id}
                href="/patients"
                className="block p-3 border rounded hover:bg-gray-100"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.diagnosis}</p>
                  </div>
                  <Badge>{p.assignedBed ?? "—"}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Admitted: {format(new Date(p.admissionDate), "MMM dd")}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
