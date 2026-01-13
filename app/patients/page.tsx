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
  const [showReAdmitDialog, setShowReAdmitDialog] = useState(false);
  const [claimInsurance, setClaimInsurance] = useState<boolean | null>(null);
  const [policyNumber, setPolicyNumber] = useState("");
  const [patientClaim, setPatientClaim] = useState<any>(null);
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [documentFilter, setDocumentFilter] = useState<DocumentType | "All">("All");
  const [loading, setLoading] = useState(true);
  const [newPatient, setNewPatient] = useState({
    uhid: "",
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

  // Handle UHID search for existing patients
  const handleUhidSearch = () => {
    if (!newPatient.uhid.trim()) {
      alert("Please enter a UHID to search");
      return;
    }

    const existingPatient = patients.find(p => p.uhid?.toLowerCase() === newPatient.uhid.toLowerCase());
    
    if (existingPatient) {
      if (existingPatient.status === "Discharged") {
        // Found a discharged patient - allow re-admission
        setFoundPatient(existingPatient);
        setShowReAdmitDialog(true);
        setShowAddDialog(false);
      } else {
        alert(`Patient with UHID ${newPatient.uhid} is already ${existingPatient.status.toLowerCase()} in the hospital.`);
      }
    } else {
      // No existing patient, allow new registration with this UHID
      setFoundPatient(null);
      alert("No existing patient found with this UHID. You can proceed to register as a new patient.");
    }
  };

  // Handle adding a new patient
  const handleAddPatient = async () => {
    try {
      if (!newPatient.name || !newPatient.age || !newPatient.phone) {
        alert("Please fill in all required fields (Name, Age, Phone)");
        return;
      }

      // Auto-generate UHID
      const allPatients = patients;
      let nextUhidNumber = 1;
      
      if (allPatients.length > 0) {
        const uhidNumbers = allPatients
          .map(p => {
            if (p.uhid) {
              const match = p.uhid.match(/^P(\d+)$/);
              return match ? parseInt(match[1]) : 0;
            }
            return 0;
          })
          .filter(num => num > 0);
        
        if (uhidNumbers.length > 0) {
          nextUhidNumber = Math.max(...uhidNumbers) + 1;
        }
      }
      
      const uhid = `P${nextUhidNumber.toString().padStart(6, '0')}`;
      const patientId = `p${Date.now()}`;

      const patientData = {
        id: patientId,
        uhid: uhid,
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
        status: (newPatient.assignedBed ? "Admitted" : "Waiting") as PatientStatus,
        assignedBed: newPatient.assignedBed || undefined,
        admissionHistory: [],
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
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: selectedBed.id,
              status: "occupied",
              patientId: addedPatient.id,
              bedNumber: selectedBed.bedNumber,
              ward: selectedBed.ward,
            }),
          });
          // Update local beds state to reflect the change
          setBeds(beds.map(b => 
            b.id === selectedBed.id 
              ? { ...b, status: "occupied", patientId: addedPatient.id }
              : b
          ));
        }
      }

      setPatients([...patients, addedPatient]);

      setNewPatient({
        uhid: "",
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

  // Handle re-admitting a discharged patient
  const handleReAdmitPatient = async () => {
    try {
      if (!foundPatient) return;

      // Move current admission to history
      const currentAdmission = {
        admissionDate: foundPatient.admissionDate,
        dischargeDate: foundPatient.dischargeDate,
        diagnosis: foundPatient.diagnosis,
        assignedBed: foundPatient.assignedBed,
        medications: foundPatient.medications,
        notes: `Discharged on ${foundPatient.dischargeDate}`,
      };

      const updatedPatientData = {
        id: foundPatient.id,
        uhid: foundPatient.uhid,
        name: newPatient.name || foundPatient.name,
        age: newPatient.age ? parseInt(newPatient.age) : foundPatient.age,
        gender: newPatient.gender || foundPatient.gender,
        phone: newPatient.phone || foundPatient.phone,
        email: newPatient.email || foundPatient.email,
        address: newPatient.address || foundPatient.address,
        bloodGroup: newPatient.bloodGroup || foundPatient.bloodGroup,
        emergencyContact: newPatient.emergencyContact || foundPatient.emergencyContact,
        diagnosis: newPatient.diagnosis || foundPatient.diagnosis,
        allergies: newPatient.allergies || foundPatient.allergies,
        medications: newPatient.medications || foundPatient.medications,
        admissionDate: new Date().toISOString(),
        dischargeDate: null,
        status: (newPatient.assignedBed ? "Admitted" : "Waiting") as PatientStatus,
        assignedBed: newPatient.assignedBed || undefined,
        admissionHistory: [...(foundPatient.admissionHistory || []), currentAdmission],
      };

      const response = await fetch("/api/patients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPatientData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to re-admit patient");
      }

      const updatedPatient = await response.json();

      // If a bed was assigned, update the bed status
      if (newPatient.assignedBed) {
        const selectedBed = beds.find(b => b.bedNumber === newPatient.assignedBed);
        if (selectedBed) {
          await fetch(`/api/beds`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: selectedBed.id,
              status: "occupied",
              patientId: foundPatient.id,
              bedNumber: selectedBed.bedNumber,
              ward: selectedBed.ward,
            }),
          });
          setBeds(beds.map(b => 
            b.id === selectedBed.id 
              ? { ...b, status: "occupied", patientId: foundPatient.id }
              : b
          ));
        }
      }

      // Update local state
      setPatients(patients.map(p => p.id === foundPatient.id ? updatedPatient : p));

      setNewPatient({
        uhid: "",
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
      setShowReAdmitDialog(false);
      setFoundPatient(null);

      alert("Patient re-admitted successfully!");
    } catch (error) {
      console.error("Error re-admitting patient:", error);
      alert(`Failed to re-admit patient: ${error.message}`);
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
    switch (status) {
      case "Waiting":
        return <Badge variant="warning">Waiting</Badge>;
      case "Admitted":
        return <Badge variant="default">Admitted</Badge>;
      case "Discharged":
        return <Badge variant="secondary">Discharged</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
                <option value="Waiting">Waiting</option>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">UHID: {patient.uhid || patient.id}</p>
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
                <DialogDescription>UHID: {selectedPatient?.uhid}</DialogDescription>
              </div>
              {selectedPatient && getStatusBadge(selectedPatient.status)}
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="history">Admission History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                      <User className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-gray-500">UHID</p>
                        <p className="font-medium">{selectedPatient?.uhid || "Not assigned"}</p>
                      </div>
                    </div>
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

            <TabsContent value="history" className="space-y-6">
              <h3 className="font-semibold text-lg">Previous Admissions</h3>
              {selectedPatient?.admissionHistory && selectedPatient.admissionHistory.length > 0 ? (
                <div className="space-y-3">
                  {selectedPatient.admissionHistory.map((admission, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Admission Date</p>
                          <p className="font-medium">
                            {format(parseISO(admission.admissionDate), "PPP")}
                          </p>
                        </div>
                        {admission.dischargeDate && (
                          <div>
                            <p className="text-gray-500">Discharge Date</p>
                            <p className="font-medium">
                              {format(parseISO(admission.dischargeDate), "PPP")}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500">Diagnosis</p>
                          <p className="font-medium">{admission.diagnosis}</p>
                        </div>
                        {admission.assignedBed && (
                          <div>
                            <p className="text-gray-500">Bed</p>
                            <p className="font-medium">{admission.assignedBed}</p>
                          </div>
                        )}
                        {admission.medications && (
                          <div className="col-span-2">
                            <p className="text-gray-500">Medications</p>
                            <p className="font-medium">{admission.medications}</p>
                          </div>
                        )}
                        {admission.notes && (
                          <div className="col-span-2">
                            <p className="text-gray-500">Notes</p>
                            <p className="font-medium text-gray-600">{admission.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No previous admissions found for this patient
                </div>
              )}
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
                  setClaimInsurance(null);
                  setPolicyNumber("");
                  // Check if patient has an existing claim by matching patient name
                  const existingClaim = claims.find(c => 
                    c.patientName === selectedPatient.name
                  );
                  setPatientClaim(existingClaim || null);
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
      <Dialog open={showDischargeDialog} onOpenChange={() => {
        setShowDischargeDialog(false);
        setClaimInsurance(null);
        setPolicyNumber("");
        setPatientClaim(null);
      }}>
        <DialogContent onClose={() => {
          setShowDischargeDialog(false);
          setClaimInsurance(null);
          setPolicyNumber("");
          setPatientClaim(null);
        }}>
          <DialogHeader>
            <DialogTitle>Initiate Discharge Process</DialogTitle>
            <DialogDescription>
              Discharge process for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            {/* Step 1: Ask about insurance claim */}
            {claimInsurance === null && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Does the patient want to claim insurance?
                  </p>
                  <p className="text-sm text-blue-700">
                    Select whether the patient wants to file an insurance claim before discharge.
                  </p>
                </div>
                <div className="flex gap-3 justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setClaimInsurance(false)}
                    className="flex-1"
                  >
                    No, Discharge Directly
                  </Button>
                  <Button
                    onClick={() => setClaimInsurance(true)}
                    className="flex-1"
                  >
                    Yes, Claim Insurance
                  </Button>
                </div>
              </>
            )}

            {/* Step 2a: Direct discharge without insurance */}
            {claimInsurance === false && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    Patient will be discharged without insurance claim. The following documents will be generated:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-green-700 list-disc list-inside">
                    <li>Discharge Summary</li>
                    <li>Final Bill</li>
                    <li>Prescription</li>
                    <li>Medical Certificate</li>
                  </ul>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setClaimInsurance(null)}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={async () => {
                      // Handle direct discharge
                      try {
                        if (!selectedPatient) return;
                        
                        const response = await fetch("/api/patients", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: selectedPatient.id,
                            status: "Discharged",
                            dischargeDate: new Date().toISOString(),
                            assignedBed: null,
                          }),
                        });

                        if (response.ok) {
                          const updatedPatient = await response.json();
                          setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
                          
                          // Free up the bed if assigned
                          if (selectedPatient.assignedBed) {
                            const bed = beds.find(b => b.bedNumber === selectedPatient.assignedBed);
                            if (bed) {
                              await fetch("/api/beds", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  id: bed.id,
                                  status: "available",
                                  patientId: null,
                                  bedNumber: bed.bedNumber,
                                  ward: bed.ward,
                                }),
                              });
                              setBeds(beds.map(b => b.id === bed.id ? { ...b, status: "available", patientId: null } : b));
                            }
                          }
                          
                          alert("Patient discharged successfully!");
                          setShowDischargeDialog(false);
                          setSelectedPatient(null);
                          setClaimInsurance(null);
                        }
                      } catch (error) {
                        console.error("Error discharging patient:", error);
                        alert("Failed to discharge patient");
                      }
                    }}
                  >
                    Confirm Discharge
                  </Button>
                </div>
              </>
            )}

            {/* Step 2b: Insurance claim flow */}
            {claimInsurance === true && (
              <>
                {patientClaim ? (
                  // Patient has existing claim - show status
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-900 mb-3">
                        Existing Insurance Claim Found
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Policy Number:</span>
                          <span className="font-medium text-blue-900">{patientClaim.policyNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Insurer:</span>
                          <span className="font-medium text-blue-900">{patientClaim.insurer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Claim Amount:</span>
                          <span className="font-medium text-blue-900">${patientClaim.claimAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Status:</span>
                          <span className="font-medium text-blue-900">{patientClaim.status}</span>
                        </div>
                        {patientClaim.status === "Approved" && (
                          <div className="flex justify-between">
                            <span className="text-blue-700">Approved Amount:</span>
                            <span className="font-medium text-green-700">${patientClaim.approvedAmount?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        Insurance claim is <strong>{patientClaim.status}</strong>. You can now proceed with discharge.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setClaimInsurance(null)}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={async () => {
                          // Handle discharge with claim
                          try {
                            if (!selectedPatient) return;
                            
                            const response = await fetch("/api/patients", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: selectedPatient.id,
                                status: "Discharged",
                                dischargeDate: new Date().toISOString(),
                                assignedBed: null,
                              }),
                            });

                            if (response.ok) {
                              const updatedPatient = await response.json();
                              setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
                              
                              // Free up the bed if assigned
                              if (selectedPatient.assignedBed) {
                                const bed = beds.find(b => b.bedNumber === selectedPatient.assignedBed);
                                if (bed) {
                                  await fetch("/api/beds", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      id: bed.id,
                                      status: "available",
                                      patientId: null,
                                      bedNumber: bed.bedNumber,
                                      ward: bed.ward,
                                    }),
                                  });
                                  setBeds(beds.map(b => b.id === bed.id ? { ...b, status: "available", patientId: null } : b));
                                }
                              }
                              
                              alert("Patient discharged successfully with insurance claim!");
                              setShowDischargeDialog(false);
                              setSelectedPatient(null);
                              setClaimInsurance(null);
                              setPolicyNumber("");
                              setPatientClaim(null);
                            }
                          } catch (error) {
                            console.error("Error discharging patient:", error);
                            alert("Failed to discharge patient");
                          }
                        }}
                      >
                        Proceed with Discharge
                      </Button>
                    </div>
                  </>
                ) : (
                  // No claim exists - prompt to create one
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        No insurance claim found for this patient. Please create an insurance claim first before proceeding with discharge.
                      </p>
                      <p className="text-sm text-yellow-700 mt-2">
                        You can create a claim from the <strong>Insurance & Claims</strong> page.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setClaimInsurance(null)}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => {
                          setShowDischargeDialog(false);
                          setClaimInsurance(null);
                          // Optionally redirect to claims page
                          window.location.href = "/claims";
                        }}
                      >
                        Go to Claims Page
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
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
            <DialogDescription>Enter patient admission details. UHID will be auto-generated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Search Existing Patient:</strong> Enter UHID to check if patient was previously registered.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter UHID (e.g., P000001)"
                  value={newPatient.uhid}
                  onChange={(e) => setNewPatient({ ...newPatient, uhid: e.target.value })}
                />
                <Button onClick={handleUhidSearch} variant="outline">
                  Search
                </Button>
              </div>
            </div>
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

      {/* Re-Admit Patient Dialog */}
      <Dialog open={showReAdmitDialog} onOpenChange={setShowReAdmitDialog}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          onClose={() => {
            setShowReAdmitDialog(false);
            setFoundPatient(null);
          }}
        >
          <DialogHeader>
            <DialogTitle>Re-Admit Patient</DialogTitle>
            <DialogDescription>
              Patient found with UHID: {foundPatient?.uhid}. Update details for re-admission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6">
            {foundPatient && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Previous Patient Details:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Name:</strong> {foundPatient.name}</div>
                  <div><strong>Age:</strong> {foundPatient.age} years</div>
                  <div><strong>Gender:</strong> {foundPatient.gender}</div>
                  <div><strong>Phone:</strong> {foundPatient.phone}</div>
                  <div><strong>Blood Group:</strong> {foundPatient.bloodGroup}</div>
                  <div><strong>Last Diagnosis:</strong> {foundPatient.diagnosis}</div>
                  {foundPatient.admissionHistory && foundPatient.admissionHistory.length > 0 && (
                    <div className="col-span-2 mt-2">
                      <strong>Previous Admissions:</strong> {foundPatient.admissionHistory.length}
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600">
              You can update the information below or keep the existing details. Only fill in the fields you want to change.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <Input
                  placeholder={foundPatient?.name || "John Doe"}
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Age</label>
                <Input
                  type="number"
                  placeholder={foundPatient?.age?.toString() || "25"}
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Gender</label>
                <Select
                  value={newPatient.gender || foundPatient?.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input
                  placeholder={foundPatient?.phone || "+1-555-0000"}
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  placeholder={foundPatient?.email || "patient@email.com"}
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Emergency Contact</label>
                <Input
                  placeholder={foundPatient?.emergencyContact || "+1-555-0000"}
                  value={newPatient.emergencyContact}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Address</label>
                <Input
                  placeholder={foundPatient?.address || "123 Main St, City, State"}
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Current Diagnosis *</label>
                <Input
                  placeholder="Enter current diagnosis"
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Allergies</label>
                <Input
                  placeholder={foundPatient?.allergies || "None"}
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Current Medications</label>
                <Input
                  placeholder={foundPatient?.medications || "None"}
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
              <Button variant="outline" onClick={() => {
                setShowReAdmitDialog(false);
                setFoundPatient(null);
                setNewPatient({
                  uhid: "",
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
              }}>
                Cancel
              </Button>
              <Button onClick={handleReAdmitPatient}>
                Re-Admit Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}