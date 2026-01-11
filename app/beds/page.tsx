"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Bed, Ward, BedStatus } from "@/lib/types";
import { Plus, Filter } from "lucide-react";

export default function BedManagementPage() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [patients, setPatients] = useState([]);
  const [selectedWard, setSelectedWard] = useState<Ward | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<BedStatus | "All">("All");
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBed, setNewBed] = useState({ bedNumber: "", ward: "General" as Ward });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bedsRes, patientsRes] = await Promise.all([
          fetch("/api/beds"),
          fetch("/api/patients"),
        ]);
        
        const bedsData = await bedsRes.json();
        const patientsData = await patientsRes.json();
        
        // Safety check: ensure we always set arrays
        setBeds(Array.isArray(bedsData) ? bedsData : []);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Set empty arrays on error
        setBeds([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle adding a new bed
  const handleAddBed = async () => {
    try {
      // Validate required fields
      if (!newBed.bedNumber || !newBed.ward) {
        alert("Please fill in all required fields");
        return;
      }

      // Check if bed number already exists
      if (beds.some(b => b.bedNumber === newBed.bedNumber)) {
        alert("Bed number already exists!");
        return;
      }

      const bedData = {
        bedNumber: newBed.bedNumber,
        ward: newBed.ward,
        status: "available" as BedStatus,
      };

      const response = await fetch("/api/beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const addedBed = await response.json();

      // Update local state
      setBeds([...beds, addedBed]);

      // Reset form and close dialog
      setNewBed({ bedNumber: "", ward: "General" });
      setShowAddDialog(false);

      alert("Bed added successfully!");
    } catch (error) {
      console.error("Error adding bed:", error);
      alert(`Failed to add bed: ${error instanceof Error ? error.message : "Please try again."}`);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const filteredBeds = beds.filter((bed) => {
    const wardMatch = selectedWard === "All" || bed.ward === selectedWard;
    const statusMatch = selectedStatus === "All" || bed.status === selectedStatus;
    return wardMatch && statusMatch;
  });

  const getPatientForBed = (bedId: string) => {
    const bed = beds.find((b) => b.id === bedId);
    if (!bed?.patientId) return null;
    return patients.find((p) => p.id === bed.patientId);
  };

  const getBedStatusColor = (status: BedStatus) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "maintenance":
        return "bg-yellow-500";
    }
  };

  const getBedStatusBadge = (status: BedStatus) => {
    switch (status) {
      case "available":
        return <Badge variant="success">Available</Badge>;
      case "occupied":
        return <Badge variant="destructive">Occupied</Badge>;
      case "maintenance":
        return <Badge variant="warning">Maintenance</Badge>;
    }
  };

  const wardStats = {
    General: beds.filter((b) => b.ward === "General"),
    ICU: beds.filter((b) => b.ward === "ICU"),
    Pediatric: beds.filter((b) => b.ward === "Pediatric"),
    Maternity: beds.filter((b) => b.ward === "Maternity"),
    Emergency: beds.filter((b) => b.ward === "Emergency"),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-8">
      <div className="flex items-center justify-between mb-8 animate-fadeIn">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">Bed Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage hospital beds and assignments</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" />
          Add New Bed
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(wardStats).map(([ward, wardBeds], idx) => {
          const occupied = wardBeds.filter((b) => b.status === "occupied").length;
          const total = wardBeds.length;
          const colors = ["from-blue-50 to-blue-100", "from-red-50 to-red-100", "from-purple-50 to-purple-100", "from-pink-50 to-pink-100", "from-orange-50 to-orange-100"];
          const borderColors = ["border-blue-300", "border-red-300", "border-purple-300", "border-pink-300", "border-orange-300"];
          return (
            <Card key={ward} style={{ animationDelay: `${idx * 80}ms` }} className={`animate-fadeIn group hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br ${colors[idx]} dark:from-slate-800 dark:to-slate-700 border-2 ${borderColors[idx]} dark:border-slate-600`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{ward}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {occupied}/{total}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {total > 0 ? ((occupied / total) * 100).toFixed(0) : 0}% occupied
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mb-6 animate-slideUp border-cyan-200 dark:border-cyan-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            <div className="flex-1 flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-700">Ward</label>
                <Select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value as Ward | "All")}
                >
                  <option value="All">All Wards</option>
                  <option value="General">General</option>
                  <option value="ICU">ICU</option>
                  <option value="Pediatric">Pediatric</option>
                  <option value="Maternity">Maternity</option>
                  <option value="Emergency">Emergency</option>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-700">Status</label>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as BedStatus | "All")}
                >
                  <option value="All">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bed Grid */}
      <Card className="animate-slideUp border-cyan-200 dark:border-cyan-800 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
          <CardTitle className="text-cyan-900 dark:text-cyan-300">Bed Overview ({filteredBeds.length} beds)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredBeds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No beds found. Click "Add New Bed" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredBeds.map((bed, idx) => (
                <button
                  key={bed.id}
                  onClick={() => setSelectedBed(bed)}
                  style={{ animationDelay: `${idx * 30}ms` }}
                  className={`
                    p-4 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-lg cursor-pointer animate-fadeIn
                    ${bed.status === "available" ? "border-green-400 bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 shadow-md" : ""}
                    ${bed.status === "occupied" ? "border-red-400 bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 shadow-md" : ""}
                    ${bed.status === "maintenance" ? "border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 shadow-md" : ""}
                  `}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-3 h-3 rounded-full mb-2 ${getBedStatusColor(
                        bed.status
                      )}`}
                    />
                    <div className="font-bold text-sm">{bed.bedNumber}</div>
                    <div className="text-xs text-gray-600 mt-1">{bed.ward}</div>
                    {bed.status === "occupied" && bed.patientId && (
                      <div className="text-xs text-gray-500 mt-1">
                        {patients.find((p) => p.id === bed.patientId)?.name.split(" ")[0]}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bed Details Dialog */}
      <Dialog open={!!selectedBed} onOpenChange={() => setSelectedBed(null)}>
        <DialogContent className="max-w-2xl" onClose={() => setSelectedBed(null)}>
          <DialogHeader>
            <DialogTitle>Bed Details - {selectedBed?.bedNumber}</DialogTitle>
            <DialogDescription>{selectedBed?.ward} Ward</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {selectedBed && getBedStatusBadge(selectedBed.status)}
            </div>

            {selectedBed?.status === "occupied" && selectedBed.patientId && (
              <>
                {(() => {
                  const patient = getPatientForBed(selectedBed.id);
                  if (!patient) return null;
                  return (
                    <div className="border rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-lg">Patient Information</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>
                          <p className="font-medium">{patient.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Age:</span>
                          <p className="font-medium">
                            {patient.age} years ({patient.gender})
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Patient ID:</span>
                          <p className="font-medium">{patient.id}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Admission Date:</span>
                          <p className="font-medium">{patient.admissionDate}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Diagnosis:</span>
                          <p className="font-medium">{patient.diagnosis}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Contact:</span>
                          <p className="font-medium">{patient.phone}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {selectedBed?.status === "available" && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">This bed is available for new patients</p>
                <Button>Assign Patient</Button>
              </div>
            )}

            {selectedBed?.status === "maintenance" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  This bed is currently under maintenance and not available for use.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedBed(null)}>
                Close
              </Button>
              {selectedBed?.status === "occupied" && (
                <Button variant="destructive">Discharge Patient</Button>
              )}
              {selectedBed?.status === "available" && (
                <Button>Assign Patient</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Bed Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent onClose={() => setShowAddDialog(false)}>
          <DialogHeader>
            <DialogTitle>Add New Bed</DialogTitle>
            <DialogDescription>Create a new bed in the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Bed Number</label>
              <Input
                placeholder="e.g., G-107"
                value={newBed.bedNumber}
                onChange={(e) => setNewBed({ ...newBed, bedNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Ward</label>
              <Select
                value={newBed.ward}
                onChange={(e) => setNewBed({ ...newBed, ward: e.target.value as Ward })}
              >
                <option value="General">General</option>
                <option value="ICU">ICU</option>
                <option value="Pediatric">Pediatric</option>
                <option value="Maternity">Maternity</option>
                <option value="Emergency">Emergency</option>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBed}>
                Add Bed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}