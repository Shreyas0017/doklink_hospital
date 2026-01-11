"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // Hospital details
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalCode, setHospitalCode] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalEmail, setHospitalEmail] = useState("");

  // Admin user details
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState("");
  const [adminPhone, setAdminPhone] = useState("");

  const handleNext = () => {
    if (!hospitalName || !hospitalCode || !hospitalAddress || !hospitalPhone || !hospitalEmail) {
      setError("Please fill in all hospital details");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (adminPassword !== adminPasswordConfirm) {
      setError("Passwords do not match");
      return;
    }

    if (adminPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/hospitals/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalName,
          hospitalCode,
          hospitalAddress,
          hospitalPhone,
          hospitalEmail,
          adminName,
          adminEmail,
          adminPassword,
          adminPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      alert("Hospital registered successfully! You can now log in.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="space-y-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center">
            Register Hospital
          </CardTitle>
          <p className="text-center text-cyan-100">
            Step {step} of 2: {step === 1 ? "Hospital Details" : "Admin Account"}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Hospital Name *
                  </label>
                  <Input
                    placeholder="City General Hospital"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Hospital Code * (Unique)
                  </label>
                  <Input
                    placeholder="hosp_001"
                    value={hospitalCode}
                    onChange={(e) => setHospitalCode(e.target.value.toLowerCase())}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Hospital Address *
                </label>
                <Input
                  placeholder="123 Medical Center Dr, City, State"
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Hospital Phone *
                  </label>
                  <Input
                    placeholder="+1-234-567-8900"
                    value={hospitalPhone}
                    onChange={(e) => setHospitalPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Hospital Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="contact@hospital.com"
                    value={hospitalEmail}
                    onChange={(e) => setHospitalEmail(e.target.value.toLowerCase())}
                    required
                  />
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                Next: Create Admin Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Admin Name *
                </label>
                <Input
                  placeholder="Dr. John Smith"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Admin Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@hospital.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value.toLowerCase())}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Admin Phone
                  </label>
                  <Input
                    placeholder="+1-234-567-8900"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password * (Min 6 characters)
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={adminPasswordConfirm}
                    onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-cyan-600 hover:text-cyan-700 font-medium"
            >
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
