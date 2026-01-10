"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Bed Management", href: "/beds", icon: Bed },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Insurance & Claims", href: "/claims", icon: FileText },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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
            <span className="font-bold text-xl text-primary">MediCare</span>
          </div>
        )}
        {collapsed && <Activity className="h-8 w-8 text-primary mx-auto" />}
      </div>

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

      {/* Theme Toggle & Collapse Button */}
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
