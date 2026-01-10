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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Patient, PatientStatus, DocumentType } from "@/lib/types";
import {
  Plus,
  Search,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Pill,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Filter,
  UserMinus,
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [documents, setDocuments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "All">("All");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDischargeDialog, setShowDischargeDialog] = useState(false);
  const [documentFilter, setDocumentFilter] = useState<DocumentType | "All">("All");
  const [loading, setLoading] = useState(true);
  const [newPatient, setNewPatient] = useState({
    id: "",
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    bloodGroup: "A+",
    emergencyContact: "",
    diagnosis: "",
    allergies: "",
    medications: "",
    assignedBed: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientsRes, docsRes, bedsRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/documents"),
          fetch("/api/beds"),
        ]);
        
        const patientsData = await patientsRes.json();
        const docsData = await docsRes.json();
        const bedsData = await bedsRes.json();
        
        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setDocuments(Array.isArray(docsData) ? docsData : []);
        setBeds(Array.isArray(bedsData) ? bedsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setPatients([]);
        setDocuments([]);
        setBeds([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle adding a new patient
  const handleAddPatient = async () => {
    try {
      if (!newPatient.name || !newPatient.age || !newPatient.phone) {
        alert("Please fill in all required fields (Name, Age, Phone)");
        return;
      }

      const patientId = newPatient.id || `P-${Date.now()}`;

      const patientData = {
        id: patientId,
        name: newPatient.name,
        age: parseInt(newPatient.age),
        gender: newPatient.gender,
        phone: newPatient.phone,
        email: newPatient.email,
        address: newPatient.address,
        bloodGroup: newPatient.bloodGroup,
        emergencyContact: newPatient.emergencyContact,
        diagnosis: newPatient.diagnosis,
        allergies: newPatient.allergies || "None",
        medications: newPatient.medications || "None",
        admissionDate: new Date().toISOString(),
        status: "Admitted" as PatientStatus,
        assignedBed: newPatient.assignedBed || undefined,
      };

      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add patient");
      }

      const addedPatient = await response.json();

      // If a bed was assigned, update the bed status
      if (newPatient.assignedBed) {
        const selectedBed = beds.find(b => b.bedNumber === newPatient.assignedBed);
        if (selectedBed) {
          await fetch(`/api/beds`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...selectedBed,
              status: "occupied",
              patientId: patientId,
            }),
          });
        }
      }

      setPatients([...patients, addedPatient]);

      setNewPatient({
        id: "",
        name: "",
        age: "",
        gender: "Male",
        phone: "",
        email: "",
        address: "",
        bloodGroup: "A+",
        emergencyContact: "",
        diagnosis: "",
        allergies: "",
        medications: "",
        assignedBed: "",
      });
      setShowAddDialog(false);

      alert("Patient added successfully!");
    } catch (error) {
      console.error("Error adding patient:", error);
      alert(`Failed to add patient: ${error.message}`);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const patientDocuments = selectedPatient
    ? documents.filter((doc) => {
        const matchesPatient = doc.patientId === selectedPatient.id;
        const matchesType = documentFilter === "All" || doc.type === documentFilter;
        return matchesPatient && matchesType;
      })
    : [];

  const availableBeds = beds.filter(b => b.status === "available");

  const getStatusBadge = (status: PatientStatus) => {
    return status === "Admitted" ? (
      <Badge variant="default">Admitted</Badge>
    ) : (
      <Badge variant="secondary">Discharged</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-8">
      <div className="flex items-center justify-between mb-8 animate-fadeIn">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent">Patient Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage patient records and admissions</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 animate-slideUp border-pink-200 dark:border-pink-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-400 dark:text-pink-500" />
              <Input
                placeholder="Search by name or patient ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-pink-200 dark:border-pink-800 dark:bg-slate-800 dark:text-white focus:border-pink-500 dark:focus:border-pink-600 focus:ring-pink-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-pink-500 dark:text-pink-400" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PatientStatus | "All")}
                className="w-40"
              >
                <option value="All">All Status</option>
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient, idx) => (
          <Card
            key={patient.id}
            style={{ animationDelay: `${idx * 100}ms` }}
            className="animate-fadeIn hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-pink-200 dark:border-pink-800 bg-gradient-to-br from-white to-pink-50 dark:from-slate-800 dark:to-slate-700"
            onClick={() => setSelectedPatient(patient)}
          >
            <CardHeader className="pb-3 border-b border-pink-100 dark:border-pink-900">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-md">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{patient.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {patient.id}</p>
                  </div>
                </div>
                {getStatusBadge(patient.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4 mr-2 text-pink-500 dark:text-pink-400" />
                  {patient.age} years, {patient.gender}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Admitted: {format(parseISO(patient.admissionDate), "MMM dd, yyyy")}
                </div>
                <div className="flex items-center text-gray-600">
                  <Heart className="h-4 w-4 mr-2" />
                  {patient.diagnosis}
                </div>
                {patient.assignedBed && (
                  <div className="mt-3 pt-3 border-t">
                    <Badge variant="outline">Bed: {patient.assignedBed}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No patients found matching your criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          onClose={() => setSelectedPatient(null)}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedPatient?.name}</DialogTitle>
                <DialogDescription>Patient ID: {selectedPatient?.id}</DialogDescription>
              </div>
              {selectedPatient && getStatusBadge(selectedPatient.status)}
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                      <User className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Age & Gender</p>
                        <p className="font-medium">
                          {selectedPatient?.age} years, {selectedPatient?.gender}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{selectedPatient?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium">{selectedPatient?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Address</p>
                        <p className="font-medium">{selectedPatient?.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Emergency Contact</p>
                        <p className="font-medium">{selectedPatient?.emergencyContact}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Admission Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Admission Date</p>
                        <p className="font-medium">
                          {selectedPatient &&
                            format(parseISO(selectedPatient.admissionDate), "PPP")}
                        </p>
                      </div>
                    </div>
                    {selectedPatient?.dischargeDate && (
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                        <div>
                          <p className="text-gray-500">Discharge Date</p>
                          <p className="font-medium">
                            {format(parseISO(selectedPatient.dischargeDate), "PPP")}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start">
                      <Heart className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Diagnosis</p>
                        <p className="font-medium">{selectedPatient?.diagnosis}</p>
                      </div>
                    </div>
                    {selectedPatient?.assignedBed && (
                      <div className="flex items-start">
                        <User className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                        <div>
                          <p className="text-gray-500">Assigned Bed</p>
                          <Badge variant="outline">{selectedPatient.assignedBed}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    <h3 className="font-semibold">Blood Group</h3>
                  </div>
                  <p className="text-lg font-medium">{selectedPatient?.bloodGroup}</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                    <h3 className="font-semibold">Allergies</h3>
                  </div>
                  <p>{selectedPatient?.allergies}</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Pill className="h-5 w-5 mr-2 text-blue-500" />
                    <h3 className="font-semibold">Current Medications</h3>
                  </div>
                  <p>{selectedPatient?.medications}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Patient Documents</h3>
                <Select
                  value={documentFilter}
                  onChange={(e) => setDocumentFilter(e.target.value as DocumentType | "All")}
                  className="w-48"
                >
                  <option value="All">All Documents</option>
                  <option value="Report">Reports</option>
                  <option value="Prescription">Prescriptions</option>
                  <option value="Lab Result">Lab Results</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                </Select>
              </div>

              <div className="space-y-3">
                {patientDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.type} • {format(parseISO(doc.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {patientDocuments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No documents found for this patient
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-6 border-t mt-6">
            <Button variant="outline" onClick={() => setSelectedPatient(null)}>
              Close
            </Button>
            {selectedPatient?.status === "Admitted" && (
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDischargeDialog(true);
                }}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Initiate Discharge
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Discharge Dialog */}
      <Dialog open={showDischargeDialog} onOpenChange={setShowDischargeDialog}>
        <DialogContent onClose={() => setShowDischargeDialog(false)}>
          <DialogHeader>
            <DialogTitle>Initiate Discharge Process</DialogTitle>
            <DialogDescription>
              Generate discharge documents for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                The following documents will be generated:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700 list-disc list-inside">
                <li>Discharge Summary</li>
                <li>Final Bill</li>
                <li>Prescription</li>
                <li>Medical Certificate</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDischargeDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle discharge logic
                  setShowDischargeDialog(false);
                  setSelectedPatient(null);
                }}
              >
                Generate Documents & Discharge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Patient Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          onClose={() => setShowAddDialog(false)}
        >
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>Enter patient admission details</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name *</label>
                <Input
                  placeholder="John Doe"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Patient ID</label>
                <Input
                  placeholder="Auto-generated"
                  value={newPatient.id}
                  onChange={(e) => setNewPatient({ ...newPatient, id: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Age *</label>
                <Input
                  type="number"
                  placeholder="25"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Gender</label>
                <Select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone *</label>
                <Input
                  placeholder="+1-555-0000"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  placeholder="patient@email.com"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Address</label>
                <Input
                  placeholder="123 Main St, City, State"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Blood Group</label>
                <Select
                  value={newPatient.bloodGroup}
                  onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                >
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Emergency Contact</label>
                <Input
                  placeholder="+1-555-0000"
                  value={newPatient.emergencyContact}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Diagnosis</label>
                <Input
                  placeholder="Enter diagnosis"
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Allergies</label>
                <Input
                  placeholder="None or list allergies"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Current Medications</label>
                <Input
                  placeholder="List current medications"
                  value={newPatient.medications}
                  onChange={(e) => setNewPatient({ ...newPatient, medications: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Assign Bed</label>
                <Select
                  value={newPatient.assignedBed}
                  onChange={(e) => setNewPatient({ ...newPatient, assignedBed: e.target.value })}
                >
                  <option value="">Select a bed (optional)</option>
                  {availableBeds.map((bed) => (
                    <option key={bed.id} value={bed.bedNumber}>
                      {bed.bedNumber} ({bed.ward})
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPatient}>
                Add Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}