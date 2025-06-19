
import React, { useState, useEffect } from "react";
import { TimeOffRequest, Staff } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TimeOffFilters from "../components/timeoff/TimeOffFilters";
import TimeOffCard from "../components/timeoff/TimeOffCard";
import AddTimeOffDialog from "../components/timeoff/AddTimeOffDialog";

export default function TimeOff() {
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    staff: "all"
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters]);

  const loadData = async () => {
    try {
      const [requestsData, staffData] = await Promise.all([
        TimeOffRequest.list('-created_date'),
        Staff.list()
      ]);
      setRequests(requestsData);
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (filters.status !== "all") {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    if (filters.type !== "all") {
      filtered = filtered.filter(req => req.type === filters.type);
    }
    if (filters.staff !== "all") {
      filtered = filtered.filter(req => req.staff_id === filters.staff);
    }

    setFilteredRequests(filtered);
  };

  const handleAddRequest = async (requestData) => {
    try {
      await TimeOffRequest.create(requestData);
      await loadData();
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding time off request:', error);
    }
  };

  const handleUpdateRequest = async (requestId, updates) => {
    try {
      await TimeOffRequest.update(requestId, updates);
      await loadData();
    } catch (error) {
      console.error('Error updating time off request:', error);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    approved: requests.filter(r => r.status === 'Approved').length,
    denied: requests.filter(r => r.status === 'Denied').length
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Time Off Management</h1>
          <p className="text-slate-600 mt-1">
            Manage time off requests and approvals
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-[#0048a1] hover:bg-[#003d8b] text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-600">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
                <p className="text-sm text-slate-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.denied}</p>
                <p className="text-sm text-slate-600">Denied</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <TimeOffFilters 
        filters={filters}
        setFilters={setFilters}
        requests={requests}
        staff={staff}
      />

      {/* Results Summary */}
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span>Showing {filteredRequests.length} of {requests.length} requests</span>
        {Object.values(filters).some(f => f !== "all") && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Filtered
          </Badge>
        )}
      </div>

      {/* Requests Grid */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="p-6 border-0 shadow-lg">
