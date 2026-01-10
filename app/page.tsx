"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { beds, patients, claims, activities } from "@/lib/data";
import {
  Bed,
  Users,
  UserCheck,
  UserMinus,
  FileText,
  TrendingUp,
  Activity,
} from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import Link from "next/link";

export default function Dashboard() {
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === "occupied").length;
  const availableBeds = beds.filter((b) => b.status === "available").length;
  const totalPatients = patients.filter((p) => p.status === "Admitted").length;
  const pendingDischarges = 2; // Mock data
  const activeClaims = claims.filter((c) => c.status !== "Approved").length;

  // Weekly admissions/discharges data
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyData = weekDays.map((day) => ({
    day: format(day, "EEE"),
    admissions: Math.floor(Math.random() * 10) + 5,
    discharges: Math.floor(Math.random() * 8) + 3,
  }));

  const maxValue = Math.max(
    ...weeklyData.map((d) => Math.max(d.admissions, d.discharges))
  );

  // Get current patients for quick view
  const currentPatients = patients.filter((p) => p.status === "Admitted").slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-8">
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Welcome to Hospital Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeIn border-blue-100 dark:border-blue-900 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-blue-500 dark:text-blue-400 group-hover:scale-125 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalBeds}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hospital capacity</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeIn border-red-100 dark:border-red-900 bg-gradient-to-br from-white to-red-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Occupied Beds</CardTitle>
            <UserCheck className="h-4 w-4 text-red-500 dark:text-red-400 group-hover:scale-125 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{occupiedBeds}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {((occupiedBeds / totalBeds) * 100).toFixed(1)}% occupancy
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeIn border-green-100 dark:border-green-900 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Beds</CardTitle>
            <Bed className="h-4 w-4 text-green-500 dark:text-green-400 group-hover:scale-125 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{availableBeds}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ready for admission</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeIn border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-125 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalPatients}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Currently admitted</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeIn border-orange-100 dark:border-orange-900 bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending Discharges</CardTitle>
            <UserMinus className="h-4 w-4 text-orange-500 dark:text-orange-400 group-hover:scale-125 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingDischarges}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ready for discharge</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeIn border-purple-100 dark:border-purple-900 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Claims</CardTitle>
            <FileText className="h-4 w-4 text-purple-500 dark:text-purple-400 group-hover:scale-125 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{activeClaims}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Bed Status Widget */}
        <Card className="lg:col-span-2 animate-slideUp border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
            <CardTitle className="text-blue-900 dark:text-blue-300">Bed Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {["General", "ICU", "Pediatric", "Maternity", "Emergency"].map((ward, idx) => {
                const wardBeds = beds.filter((b) => b.ward === ward);
                return (
                  <div key={ward} style={{ animationDelay: `${idx * 100}ms` }} className="animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">{ward}</span>
                      <span className="text-sm text-gray-500">
                        {wardBeds.filter((b) => b.status === "occupied").length}/
                        {wardBeds.length} occupied
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {wardBeds.map((bed) => (
                        <Link
                          key={bed.id}
                          href="/beds"
                          className={`
                            w-12 h-12 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer 
                            transition-all duration-300 hover:scale-125 hover:shadow-lg
                            ${
                              bed.status === "available"
                                ? "bg-gradient-to-br from-green-100 to-green-200 text-green-700 border-2 border-green-400 hover:from-green-200 hover:to-green-300"
                                : bed.status === "occupied"
                                ? "bg-gradient-to-br from-red-100 to-red-200 text-red-700 border-2 border-red-400 hover:from-red-200 hover:to-red-300"
                                : "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 border-2 border-yellow-400 hover:from-yellow-200 hover:to-yellow-300"
                            }
                          `}
                        >
                          {bed.bedNumber.split("-")[1]}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Maintenance</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-slideUp border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700">
            <CardTitle className="text-purple-900 dark:text-purple-300">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {activities.map((activity, idx) => (
                <div key={activity.id} style={{ animationDelay: `${idx * 100}ms` }} className="animate-fadeIn flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div
                    className={`
                    mt-1 p-2 rounded-full flex-shrink-0
                    ${activity.type === "admission" ? "bg-blue-100" : ""}
                    ${activity.type === "discharge" ? "bg-green-100" : ""}
                    ${activity.type === "claim" ? "bg-purple-100" : ""}
                  `}
                  >
                    {activity.type === "admission" && (
                      <UserCheck className="h-4 w-4 text-blue-600 animate-bounce-sm" />
                    )}
                    {activity.type === "discharge" && (
                      <UserMinus className="h-4 w-4 text-green-600 animate-bounce-sm" />
                    )}
                    {activity.type === "claim" && (
                      <FileText className="h-4 w-4 text-purple-600 animate-bounce-sm" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 animate-slideUp border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-indigo-900 dark:text-indigo-300">Weekly Performance</CardTitle>
              <TrendingUp className="h-5 w-5 text-indigo-400 dark:text-indigo-300 animate-bounce-sm" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {weeklyData.map((data, index) => (
                <div key={index} style={{ animationDelay: `${index * 80}ms` }} className="animate-fadeIn">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium w-12 text-gray-700">{data.day}</span>
                    <div className="flex-1 flex gap-2 items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded transition-all duration-500 hover:from-blue-500 hover:to-blue-600"
                            style={{
                              width: `${(data.admissions / maxValue) * 100}%`,
                            }}
                          />
                          <span className="text-xs text-gray-600">
                            {data.admissions} admissions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-12"></span>
                    <div className="flex-1 flex gap-2 items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 bg-gradient-to-r from-green-400 to-green-500 rounded transition-all duration-500 hover:from-green-500 hover:to-green-600"
                            style={{
                              width: `${(data.discharges / maxValue) * 100}%`,
                            }}
                          />
                          <span className="text-xs text-gray-600">
                            {data.discharges} discharges
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Admissions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Discharges</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Patients Widget */}
        <Card className="animate-slideUp border-green-200 dark:border-green-800 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700">
            <CardTitle className="text-green-900 dark:text-green-300">Current Patients</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {currentPatients.map((patient, idx) => (
                <Link
                  key={patient.id}
                  href="/patients"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  className="animate-fadeIn block p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.diagnosis}</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                      {patient.assignedBed}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Admitted: {format(parseISO(patient.admissionDate), "MMM dd")}
                  </div>
                </Link>
              ))}
              <Link
                href="/patients"
                className="block text-center text-sm text-green-600 hover:text-green-700 hover:underline mt-4 font-medium transition-colors duration-200"
              >
                View all patients →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
