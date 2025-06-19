
import React, { useState, useEffect } from "react";
import { Staff, Role, TimeOffRequest } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  TrendingUp, 
  Clock,
  Building2,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

import StatsGrid from "../components/dashboard/StatsGrid";
import RecentHires from "../components/dashboard/RecentHires";
import PendingRequests from "../components/dashboard/PendingRequests";
import DepartmentOverview from "../components/dashboard/DepartmentOverview";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    pendingRequests: 0,
    recentHires: 0
  });
  const [recentHires, setRecentHires] = useState([]);
  const [pendingTimeOff, setPendingTimeOff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [staffData, timeOffData] = await Promise.all([
        Staff.list('-created_date'),
        TimeOffRequest.filter({ status: 'Pending' }, '-created_date')
      ]);

      // Calculate stats
      const activeStaff = staffData.filter(s => s.status === 'Active').length;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHiresCount = staffData.filter(s => 
        new Date(s.hire_date) > thirtyDaysAgo
      ).length;

      setStats({
        totalStaff: staffData.length,
        activeStaff,
        pendingRequests: timeOffData.length,
        recentHires: recentHiresCount
      });

      // Get recent hires (last 5)
      const recent = staffData
        .filter(s => s.hire_date)
        .sort((a, b) => new Date(b.hire_date) - new Date(a.hire_date))
        .slice(0, 5);
      setRecentHires(recent);

      // Get pending time off requests
      setPendingTimeOff(timeOffData.slice(0, 5));

      // Calculate department distribution
      const deptCounts = {};
      staffData.forEach(staff => {
        deptCounts[staff.department] = (deptCounts[staff.department] || 0) + 1;
      });
      const deptData = Object.entries(deptCounts).map(([name, count]) => ({
        name,
        count,
        percentage: ((count / staffData.length) * 100).toFixed(1)
      }));
      setDepartments(deptData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your team.</p>
        </div>
        <Link to={createPageUrl("StaffDirectory")}>
          <Button className="bg-[#0048a1] hover:bg-[#003d8b] text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Staff
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} isLoading={isLoading} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Hires */}
        <div className="lg:col-span-2">
          <RecentHires hires={recentHires} isLoading={isLoading} />
        </div>

        {/* Pending Requests */}
        <div>
          <PendingRequests requests={pendingTimeOff} isLoading={isLoading} />
        </div>

        {/* Department Overview */}
        <div className="lg:col-span-3">
          <DepartmentOverview departments={departments} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
