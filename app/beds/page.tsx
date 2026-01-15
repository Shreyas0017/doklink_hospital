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
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedPatientForBed, setSelectedPatientForBed] = useState("");
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
        
        setBeds(Array.isArray(bedsData) ? bedsData : []);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setBeds([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAddBed = async () => {
    try {
      if (!newBed.bedNumber || !newBed.ward) {
        alert("Please fill in all required fields");
        return;
      }

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
      setBeds([...beds, addedBed]);
      setNewBed({ bedNumber: "", ward: "General" });
      setShowAddDialog(false);
      alert("Bed added successfully!");
    } catch (error) {
      console.error("Error adding bed:", error);
      alert(`Failed to add bed: ${error instanceof Error ? error.message : "Please try again."}`);
    }
  };

  const handleAssignPatient = async () => {
    try {
      if (!selectedBed || !selectedPatientForBed) {
        alert("Please select a patient");
        return;
      }

      const selectedPatient = patients.find(p => p.id === selectedPatientForBed);
      if (!selectedPatient) {
        alert("Patient not found");
        return;
      }

      const bedResponse = await fetch("/api/beds", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedBed.id,
          status: "occupied",
          patientId: selectedPatientForBed,
          bedNumber: selectedBed.bedNumber,
          ward: selectedBed.ward,
        }),
      });

      if (!bedResponse.ok) {
        throw new Error("Failed to update bed");
      }

      const updatedBed = await bedResponse.json();

      const patientResponse = await fetch("/api/patients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPatientForBed,
          assignedBed: selectedBed.bedNumber,
          status: "Admitted",
        }),
      });

      if (!patientResponse.ok) {
        throw new Error("Failed to update patient");
      }

      setBeds(beds.map(b => b.id === selectedBed.id ? updatedBed : b));
      setPatients(patients.map(p => 
        p.id === selectedPatientForBed 
          ? { ...p, assignedBed: selectedBed.bedNumber, status: "Admitted" }
          : p
      ));

      setShowAssignDialog(false);
      setSelectedBed(null);
      setSelectedPatientForBed("");
      alert("Patient assigned to bed successfully!");
    } catch (error) {
      console.error("Error assigning patient:", error);
      alert(`Failed to assign patient: ${error instanceof Error ? error.message : "Please try again."}`);
    }
  };

  const handleDischargePatient = async () => {
    try {
      if (!selectedBed || !selectedBed.patientId) {
        alert("No patient assigned to this bed");
        return;
      }

      const bedResponse = await fetch("/api/beds", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedBed.id,
          status: "available",
          patientId: null,
          bedNumber: selectedBed.bedNumber,
          ward: selectedBed.ward,
        }),
      });

      if (!bedResponse.ok) {
        throw new Error("Failed to update bed");
      }

      const updatedBed = await bedResponse.json();

      const patientResponse = await fetch("/api/patients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedBed.patientId,
          assignedBed: null,
          status: "Discharged",
        }),
      });

      if (!patientResponse.ok) {
        throw new Error("Failed to update patient");
      }

      setBeds(beds.map(b => b.id === selectedBed.id ? updatedBed : b));
      setPatients(patients.map(p => 
        p.id === selectedBed.patientId 
          ? { ...p, assignedBed: null, status: "Discharged" }
          : p
      ));

      setSelectedBed(null);
      alert("Patient discharged from bed successfully!");
    } catch (error) {
      console.error("Error discharging patient:", error);
      alert(`Failed to discharge patient: ${error instanceof Error ? error.message : "Please try again."}`);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

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
        return "bg-white";
      case "occupied":
        return "bg-gray-600";
      case "maintenance":
        return "bg-gray-400";
    }
  };

  const getBedStatusBadge = (status: BedStatus) => {
    switch (status) {
      case "available":
        return <Badge className="bg-white text-black">Available</Badge>;
      case "occupied":
        return <Badge className="bg-gray-700 text-white">Occupied</Badge>;
      case "maintenance":
        return <Badge className="bg-gray-500 text-white">Maintenance</Badge>;
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
    <div className="min-h-screen bg-black p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white">Bed Management</h1>
          <p className="text-gray-400 mt-2 text-lg">Manage hospital beds and assignments across all wards</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-white hover:bg-gray-200 text-black shadow-lg font-semibold">
          <Plus className="h-5 w-5 mr-2" />
          Add New Bed
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {Object.entries(wardStats).map(([ward, wardBeds]) => {
          const occupied = wardBeds.filter((b) => b.status === "occupied").length;
          const total = wardBeds.length;
          return (
            <Card key={ward} className="bg-black border-2 border-white shadow-lg hover:shadow-xl transition-shadow group">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-full text-center group-hover:bg-white group-hover:text-black transition-colors">{ward}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">
                  {occupied}/{total}
                </div>
                <p className="text-sm font-medium text-gray-400 mt-2">
                  {total > 0 ? ((occupied / total) * 100).toFixed(0) : 0}% occupied
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mb-6 border-2 border-white shadow-lg bg-black">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-white" />
            <div className="flex-1 flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-white">Ward</label>
                <Select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value as Ward | "All")}
                  className="border-2 border-white/20 focus:border-white bg-black text-white"
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
                <label className="text-sm font-medium mb-1 block text-white">Status</label>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as BedStatus | "All")}
                  className="border-2 border-white/20 focus:border-white bg-black text-white"
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
      <Card className="border-2 border-white shadow-lg bg-black">
        <CardHeader className="bg-black text-white border-b-2 border-white">
          <CardTitle className="text-white font-bold">Bed Overview ({filteredBeds.length} beds)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 bg-black">
          {filteredBeds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No beds found. Click "Add New Bed" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredBeds.map((bed) => (
                <button
                  key={bed.id}
                  onClick={() => setSelectedBed(bed)}
                  className={`
                    p-4 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-lg cursor-pointer
                    ${bed.status === "available" ? "border-white bg-black text-white" : ""}
                    ${bed.status === "occupied" ? "border-white bg-gray-700 text-white" : ""}
                    ${bed.status === "maintenance" ? "border-gray-400 bg-gray-500 text-white" : ""}
                  `}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-3 h-3 rounded-full mb-2 ${getBedStatusColor(bed.status)} border border-current`}
                    />
                    <div className="font-bold text-sm">{bed.bedNumber}</div>
                    <div className="text-xs opacity-70 mt-1">{bed.ward}</div>
                    {bed.status === "occupied" && bed.patientId && (
                      <div className="text-xs opacity-70 mt-1">
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
        <DialogContent className="max-w-2xl bg-black border-2 border-white text-white" onClose={() => setSelectedBed(null)}>
          <DialogHeader>
            <DialogTitle className="text-white">Bed Details - {selectedBed?.bedNumber}</DialogTitle>
            <DialogDescription className="text-gray-400">{selectedBed?.ward} Ward</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Status:</span>
              {selectedBed && getBedStatusBadge(selectedBed.status)}
            </div>

            {selectedBed?.status === "occupied" && selectedBed.patientId && (
              <>
                {(() => {
                  const patient = getPatientForBed(selectedBed.id);
                  if (!patient) return null;
                  return (
                    <div className="border-2 border-white rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-lg text-white">Patient Information</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Name:</span>
                          <p className="font-medium text-white">{patient.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Age:</span>
                          <p className="font-medium text-white">
                            {patient.age} years ({patient.gender})
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Patient ID:</span>
                          <p className="font-medium text-white">{patient.id}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Admission Date:</span>
                          <p className="font-medium text-white">{patient.admissionDate}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Diagnosis:</span>
                          <p className="font-medium text-white">{patient.diagnosis}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Contact:</span>
                          <p className="font-medium text-white">{patient.phone}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {selectedBed?.status === "available" && (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">This bed is available for new patients</p>
                <Button onClick={() => setShowAssignDialog(true)} className="bg-white hover:bg-gray-200 text-black font-semibold">Assign Patient</Button>
              </div>
            )}

            {selectedBed?.status === "maintenance" && (
              <div className="bg-white/10 border-2 border-white/30 rounded-lg p-4">
                <p className="text-white">
                  This bed is currently under maintenance and not available for use.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t-2 border-white/20">
              <Button variant="outline" onClick={() => setSelectedBed(null)} className="border-2 border-white hover:bg-white hover:text-black text-white">
                Close
              </Button>
              {selectedBed?.status === "occupied" && (
                <Button onClick={handleDischargePatient} className="bg-white hover:bg-gray-200 text-black font-semibold">Discharge Patient</Button>
              )}
              {selectedBed?.status === "available" && (
                <Button onClick={() => setShowAssignDialog(true)} className="bg-white hover:bg-gray-200 text-black font-semibold">Assign Patient</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Bed Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent onClose={() => setShowAddDialog(false)} className="bg-black border-2 border-white text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Bed</DialogTitle>
            <DialogDescription className="text-gray-400">Create a new bed in the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div>
              <label className="text-sm font-medium mb-1 block text-white">Bed Number</label>
              <Input
                placeholder="e.g., G-107"
                value={newBed.bedNumber}
                onChange={(e) => setNewBed({ ...newBed, bedNumber: e.target.value })}
                className="border-2 border-white/20 focus:border-white bg-black text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-white">Ward</label>
              <Select
                value={newBed.ward}
                onChange={(e) => setNewBed({ ...newBed, ward: e.target.value as Ward })}
                className="border-2 border-white/20 focus:border-white bg-black text-white"
              >
                <option value="General">General</option>
                <option value="ICU">ICU</option>
                <option value="Pediatric">Pediatric</option>
                <option value="Maternity">Maternity</option>
                <option value="Emergency">Emergency</option>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-2 border-white hover:bg-white hover:text-black text-white">
                Cancel
              </Button>
              <Button onClick={handleAddBed} className="bg-white hover:bg-gray-200 text-black font-semibold">
                Add Bed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Patient Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent onClose={() => setShowAssignDialog(false)} className="bg-black border-2 border-white text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Assign Patient to Bed {selectedBed?.bedNumber}</DialogTitle>
            <DialogDescription className="text-gray-400">Select a patient to assign to this bed</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div>
              <label className="text-sm font-medium mb-1 block text-white">Select Patient</label>
              <Select
                value={selectedPatientForBed}
                onChange={(e) => setSelectedPatientForBed(e.target.value)}
                className="border-2 border-white/20 focus:border-white bg-black text-white"
              >
                <option value="">Choose a patient...</option>
                {patients
                  .filter((p) => (p.status === "Waiting" || p.status === "Admitted") && !p.assignedBed)
                  .map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.id} ({patient.diagnosis})
                    </option>
                  ))}
              </Select>
              {patients.filter((p) => (p.status === "Waiting" || p.status === "Admitted") && !p.assignedBed).length === 0 && (
                <p className="text-sm text-gray-400 mt-2">No patients available for assignment</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowAssignDialog(false);
                setSelectedPatientForBed("");
              }} className="border-2 border-white hover:bg-white hover:text-black text-white">
                Cancel
              </Button>
              <Button 
                onClick={handleAssignPatient}
                disabled={!selectedPatientForBed}
                className="bg-white hover:bg-gray-200 text-black font-semibold disabled:opacity-50"
              >
                Assign Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}