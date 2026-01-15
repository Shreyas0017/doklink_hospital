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
import { Progress } from "@/components/ui/progress";
import { Claim, ClaimStatus, ExpenseStatus, Patient } from "@/lib/types";
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
  Building2,
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newClaim, setNewClaim] = useState({
    patientId: "",
    policyNumber: "",
    insurer: "",
    claimAmount: "",
    diagnosis: "",
    treatment: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [claimsRes, patientsRes] = await Promise.all([
          fetch("/api/claims"),
          fetch("/api/patients"),
        ]);
        
        const claimsData = await claimsRes.json();
        const patientsData = await patientsRes.json();
        
        setClaims(Array.isArray(claimsData) ? claimsData : []);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setClaims([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAddClaim = async () => {
    try {
      if (!newClaim.patientId || !newClaim.policyNumber || !newClaim.insurer || !newClaim.claimAmount) {
        alert("Please fill in all required fields");
        return;
      }

      const selectedPatient = patients.find(p => p.id === newClaim.patientId);
      if (!selectedPatient) {
        alert("Selected patient not found");
        return;
      }

      const claimData = {
        id: `CLM-${Date.now()}`,
        patientName: selectedPatient.name,
        policyNumber: newClaim.policyNumber,
        insurer: newClaim.insurer,
        claimAmount: parseFloat(newClaim.claimAmount),
        approvedAmount: 0,
        pendingAmount: parseFloat(newClaim.claimAmount),
        rejectedAmount: 0,
        status: "Pending" as ClaimStatus,
        submissionDate: new Date().toISOString(),
        diagnosis: newClaim.diagnosis || selectedPatient.diagnosis,
        treatment: newClaim.treatment,
        expenses: [],
        approvalHistory: [
          {
            id: `HIST-${Date.now()}`,
            description: "Claim submitted for review",
            amount: parseFloat(newClaim.claimAmount),
            status: "Approved" as const,
            date: new Date().toISOString(),
          },
        ],
      };

      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimData),
      });

      if (!response.ok) {
        throw new Error("Failed to create claim");
      }

      const addedClaim = await response.json();
      setClaims([...claims, addedClaim]);

      setNewClaim({
        patientId: "",
        policyNumber: "",
        insurer: "",
        claimAmount: "",
        diagnosis: "",
        treatment: "",
      });
      setShowAddDialog(false);

      alert("Claim created successfully!");
    } catch (error) {
      console.error("Error creating claim:", error);
      alert("Failed to create claim. Please try again.");
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  const filteredClaims = claims.filter(
    (claim) =>
      claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.insurer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-yellow-500 text-black">Pending</Badge>;
      case "Approved":
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      case "Partial":
        return <Badge className="bg-gray-500 text-white">Partial</Badge>;
    }
  };

  const getExpenseStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-yellow-500 text-black text-xs">Pending</Badge>;
      case "Approved":
        return <Badge className="bg-green-500 text-white text-xs">Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-red-500 text-white text-xs">Rejected</Badge>;
    }
  };

  const getExpenseStatusIcon = (status: ExpenseStatus) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white">Insurance & Claims</h1>
          <p className="text-gray-400 mt-2 text-lg">Manage insurance claims, approvals, and reimbursements</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-white hover:bg-gray-200 text-black shadow-lg font-semibold">
          <Plus className="h-5 w-5 mr-2" />
          Create Claim
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6 border-2 border-white shadow-lg bg-black">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient name, policy number, or insurer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-white/20 focus:border-white bg-black text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card className="border-2 border-white shadow-lg bg-black mt-6">
        <CardHeader className="bg-black text-white border-b-2 border-white">
          <CardTitle className="text-white font-bold text-xl">Claims Overview ({filteredClaims.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No claims found. Click "Create Claim" to add one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-white/20">
                    <th className="text-left py-4 px-4 font-bold text-sm text-white">Patient</th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-white">Policy Number</th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-white">Insurer</th>
                    <th className="text-right py-4 px-4 font-bold text-sm text-white">Claim Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-white">Approved</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-white">Submission Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => (
                    <tr key={claim.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{claim.patientName}</td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-400">{claim.policyNumber}</td>
                      <td className="py-3 px-4 text-gray-300">{claim.insurer}</td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        ${claim.claimAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-500">
                        ${claim.approvedAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(claim.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {format(parseISO(claim.submissionDate), "MMM dd, yyyy")}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedClaim(claim)}
                          className="hover:bg-white/10 hover:text-white text-gray-300"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Details Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent
          className="max-w-5xl max-h-[90vh] overflow-y-auto bg-black border-2 border-white text-white"
          onClose={() => setSelectedClaim(null)}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white">Claim Details - {selectedClaim?.patientName}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Policy: {selectedClaim?.policyNumber}
                </DialogDescription>
              </div>
              {selectedClaim && getStatusBadge(selectedClaim.status)}
            </div>
          </DialogHeader>

          <div className="space-y-6 p-6">
            {/* Overview Section */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-white">Claim Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <Building2 className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Insurance Provider</p>
                      <p className="font-medium text-white">{selectedClaim?.insurer}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Submission Date</p>
                      <p className="font-medium text-white">
                        {selectedClaim && format(parseISO(selectedClaim.submissionDate), "PPP")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Diagnosis</p>
                      <p className="font-medium text-white">{selectedClaim?.diagnosis}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Treatment</p>
                      <p className="font-medium text-white">{selectedClaim?.treatment}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-white">Financial Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <span className="text-sm font-medium text-white">Total Claim Amount</span>
                    <span className="text-lg font-bold text-blue-400">
                      ${selectedClaim?.claimAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <span className="text-sm font-medium text-white">Approved Amount</span>
                    <span className="text-lg font-bold text-green-400">
                      ${selectedClaim?.approvedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <span className="text-sm font-medium text-white">Pending Amount</span>
                    <span className="text-lg font-bold text-yellow-400">
                      ${selectedClaim?.pendingAmount.toLocaleString()}
                    </span>
                  </div>
                  {selectedClaim && selectedClaim.rejectedAmount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <span className="text-sm font-medium text-white">Rejected Amount</span>
                      <span className="text-lg font-bold text-red-400">
                        ${selectedClaim.rejectedAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expense Approval Summary */}
            {selectedClaim && selectedClaim.expenses.length > 0 && (
              <div className="border-2 border-white/20 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center text-white">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Expense Approval Summary
                </h3>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-white">
                      ${selectedClaim.claimAmount.toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <Progress value={100} className="h-2 bg-white/20" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Approved</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${selectedClaim.approvedAmount.toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={(selectedClaim.approvedAmount / selectedClaim.claimAmount) * 100}
                        className="h-2 bg-white/20 [&>div]:bg-green-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {((selectedClaim.approvedAmount / selectedClaim.claimAmount) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      ${selectedClaim.pendingAmount.toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={(selectedClaim.pendingAmount / selectedClaim.claimAmount) * 100}
                        className="h-2 bg-white/20 [&>div]:bg-yellow-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {((selectedClaim.pendingAmount / selectedClaim.claimAmount) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Rejected</p>
                    <p className="text-2xl font-bold text-red-400">
                      ${selectedClaim.rejectedAmount.toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={(selectedClaim.rejectedAmount / selectedClaim.claimAmount) * 100}
                        className="h-2 bg-white/20 [&>div]:bg-red-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {((selectedClaim.rejectedAmount / selectedClaim.claimAmount) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white/10 border border-white/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">Patient Liability (Remaining Amount)</span>
                    <span className="text-xl font-bold text-white">
                      ${(selectedClaim.claimAmount - selectedClaim.approvedAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Expense Breakdown */}
            {selectedClaim && selectedClaim.expenses.length > 0 && (
              <div className="border-2 border-white/20 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-white">Daily Expense Breakdown</h3>
                <div className="space-y-3">
                  {selectedClaim.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {getExpenseStatusIcon(expense.status)}
                        <div>
                          <p className="font-medium text-white">{expense.description}</p>
                          <p className="text-sm text-gray-400">
                            {format(parseISO(expense.date), "MMM dd, yyyy")}
                          </p>
                          {expense.notes && (
                            <p className="text-xs text-gray-500 mt-1">{expense.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-white">${expense.amount.toLocaleString()}</p>
                            {expense.approvedAmount !== undefined &&
                              expense.approvedAmount !== expense.amount && (
                                <p className="text-sm text-green-400">
                                  Approved: ${expense.approvedAmount.toLocaleString()}
                                </p>
                              )}
                          </div>
                          {getExpenseStatusBadge(expense.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval History Timeline */}
            {selectedClaim && selectedClaim.approvalHistory.length > 0 && (
              <div className="border-2 border-white/20 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-white">Approval History</h3>
                <div className="space-y-4">
                  {selectedClaim.approvalHistory.map((history, index) => (
                    <div key={history.id} className="flex items-start space-x-4">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center
                          ${history.status === "Approved" ? "bg-green-500/20 border-2 border-green-500" : "bg-red-500/20 border-2 border-red-500"}`}
                        >
                          {history.status === "Approved" ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        {index < selectedClaim.approvalHistory.length - 1 && (
                          <div className="absolute left-1/2 top-10 w-0.5 h-8 bg-white/20 -translate-x-1/2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white">{history.description}</p>
                          <span
                            className={`font-bold ${
                              history.status === "Approved"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            ${history.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {format(parseISO(history.date), "PPP")}
                        </p>
                        <Badge
                          className={`mt-2 text-xs ${history.status === "Approved" ? "bg-green-500" : "bg-red-500"} text-white`}
                        >
                          {history.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-6 border-t-2 border-white/20">
              <Button variant="outline" onClick={() => setSelectedClaim(null)} className="border-2 border-white hover:bg-white hover:text-black text-white">
                Close
              </Button>
              {selectedClaim?.status === "Pending" && (
                <Button className="bg-white hover:bg-gray-200 text-black font-semibold">Submit to Insurance</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Claim Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto bg-black border-2 border-white text-white"
          onClose={() => setShowAddDialog(false)}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Create New Claim</DialogTitle>
            <DialogDescription className="text-gray-400">Submit a new insurance claim</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-white">Patient</label>
                <Select
                  value={newClaim.patientId}
                  onChange={(e) => setNewClaim({ ...newClaim, patientId: e.target.value })}
                  className="border-2 border-white/20 focus:border-white bg-black text-white"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.uhid}) - {patient.status}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-white">Policy Number</label>
                <Input
                  placeholder="POL-XXXX-XXX"
                  value={newClaim.policyNumber}
                  onChange={(e) => setNewClaim({ ...newClaim, policyNumber: e.target.value })}
                  className="border-2 border-white/20 focus:border-white bg-black text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-white">Insurance Provider</label>
                <Input
                  placeholder="Insurance company name"
                  value={newClaim.insurer}
                  onChange={(e) => setNewClaim({ ...newClaim, insurer: e.target.value })}
                  className="border-2 border-white/20 focus:border-white bg-black text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-white">Claim Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newClaim.claimAmount}
                  onChange={(e) => setNewClaim({ ...newClaim, claimAmount: e.target.value })}
                  className="border-2 border-white/20 focus:border-white bg-black text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block text-white">Diagnosis</label>
                <Input
                  placeholder="Enter diagnosis (optional - will use patient's diagnosis)"
                  value={newClaim.diagnosis}
                  onChange={(e) => setNewClaim({ ...newClaim, diagnosis: e.target.value })}
                  className="border-2 border-white/20 focus:border-white bg-black text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block text-white">Treatment Details</label>
                <Input
                  placeholder="Describe treatment provided"
                  value={newClaim.treatment}
                  onChange={(e) => setNewClaim({ ...newClaim, treatment: e.target.value })}
                  className="border-2 border-white/20 focus:border-white bg-black text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t-2 border-white/20">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-2 border-white hover:bg-white hover:text-black text-white">
                Cancel
              </Button>
              <Button onClick={handleAddClaim} className="bg-white hover:bg-gray-200 text-black font-semibold">
                Create Claim
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}