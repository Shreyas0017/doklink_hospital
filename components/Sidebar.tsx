"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Bed,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  Activity,
  Moon,
  Sun,
  LogOut,
  Building2,
  UserCircle,
  Shield,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  // Dynamic navigation based on user role
  const getNavigation = () => {
    const baseNavigation = [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ];

    // SuperAdmin sees only their dashboard
    if (session?.user?.role === "SuperAdmin") {
      return [
        { name: "Super Admin", href: "/superadmin", icon: Shield },
        { name: "Manage Users", href: "/users", icon: UserCog },
      ];
    }

    // HospitalAdmin sees hospital operations + user management
    if (session?.user?.role === "HospitalAdmin") {
      return [
        ...baseNavigation,
        { name: "Bed Management", href: "/beds", icon: Bed },
        { name: "Patients", href: "/patients", icon: Users },
        { name: "Insurance & Claims", href: "/claims", icon: FileText },
        { name: "Manage Users", href: "/users", icon: UserCog },
      ];
    }

    // BasicUser sees only hospital operations
    return [
      ...baseNavigation,
      { name: "Bed Management", href: "/beds", icon: Bed },
      { name: "Patients", href: "/patients", icon: Users },
      { name: "Insurance & Claims", href: "/claims", icon: FileText },
    ];
  };

  const navigation = getNavigation();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary">DokLink</span>
          </div>
        )}
        {collapsed && <Activity className="h-8 w-8 text-primary mx-auto" />}
      </div>

      {/* Hospital & User Info */}
      {session && !collapsed && (
        <div className="px-4 py-3 border-b border-border bg-accent/50">
          {session.user.role !== "SuperAdmin" && (
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground truncate">
                {session.user.hospitalName}
              </span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <UserCircle className="h-4 w-4 text-foreground/60" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-foreground/60 truncate">
                {session.user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle, Logout & Collapse Button */}
      <div className="border-t border-border">
        <button
          onClick={toggleTheme}
          className="w-full h-12 flex items-center justify-center hover:bg-accent transition-colors text-foreground/70 hover:text-foreground"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Sun className="h-5 w-5 flex-shrink-0" />
          )}
          {!collapsed && (
            <span className="ml-3 text-sm font-medium">
              {theme === "light" ? "Dark" : "Light"} Mode
            </span>
          )}
        </button>

        {session && (
          <button
            onClick={handleLogout}
            className="w-full h-12 flex items-center justify-center border-t border-border hover:bg-accent transition-colors text-foreground/70 hover:text-foreground"
            title="Logout"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-12 flex items-center justify-center border-t border-border hover:bg-accent transition-colors text-foreground/70 hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
