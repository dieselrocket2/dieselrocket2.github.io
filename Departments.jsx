import React, { useState, useEffect } from "react";
import { Department, Staff } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Building2, 
  Users, 
  Search,
  TrendingUp,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import DepartmentCard from "../components/departments/DepartmentCard";
import AddDepartmentDialog from "../components/departments/AddDepartmentDialog";
import DepartmentView from "../components/departments/DepartmentView";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applySearch();
  }, [departments, searchTerm]);

  const loadData = async () => {
    try {
      const [departmentsData, staffData] = await Promise.all([
        Department.list('-created_date'),
        Staff.list()
      ]);
      setDepartments(departmentsData);
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchTerm) {
      setFilteredDepartments(departments);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = departments.filter(dept =>
      dept.name?.toLowerCase().includes(search) ||
      dept.description?.toLowerCase().includes(search) ||
      dept.location?.toLowerCase().includes(search)
    );
    setFilteredDepartments(filtered);
  };

  const handleAddDepartment = async (deptData) => {
    try {
      await Department.create(deptData);
      await loadData();
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const handleUpdateDepartment = async (deptId, deptData) => {
    try {
      await Department.update(deptId, deptData);
      await loadData();
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    try {
      await Department.delete(deptId);
      await loadData();
      if (selectedDepartment?.id === deptId) {
        setSelectedDepartment(null);
      }
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const getDepartmentStats = (dept) => {
    const deptStaff = staff.filter(s => s.department === dept.name);
    const activeStaff = deptStaff.filter(s => s.status === 'Active').length;
    const headOfDept = staff.find(s => s.id === dept.head_of_department);
    
    return {
      totalStaff: deptStaff.length,
      activeStaff,
      headOfDepartment: headOfDept
    };
  };

  const stats = {
    total: departments.length,
    active: departments.filter(d => d.status === 'Active').length,
    totalStaff: staff.length,
    totalBudget: departments.reduce((sum, d) => sum + (d.budget || 0), 0)
  };

  if (selectedDepartment) {
    return (
      <DepartmentView 
        department={selectedDepartment}
        staff={staff}
        onBack={() => setSelectedDepartment(null)}
        onUpdate={handleUpdateDepartment}
        onDelete={handleDeleteDepartment}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Departments</h1>
          <p className="text-slate-600 mt-1">
            Manage organizational departments and their structure
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-[#0048a1] hover:bg-[#003d8b] text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#0048a1]/10 rounded-xl">
                <Building2 className="w-6 h-6 text-[#0048a1]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-600">Total Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                <p className="text-sm text-slate-600">Active Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalStaff}</p>
                <p className="text-sm text-slate-600">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${(stats.totalBudget / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-slate-600">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus:border-[#0048a1] focus:ring-[#0048a1]/20"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span>Showing {filteredDepartments.length} of {departments.length} departments</span>
        {searchTerm && (
          <Badge variant="outline" className="bg-[#0048a1]/10 text-[#0048a1] border-[#0048a1]/20">
            Search: "{searchTerm}"
          </Badge>
        )}
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="p-6 border-0 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                    </div>
                  </div>
                </Card>
              </div>
            ))
          ) : filteredDepartments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm ? 'No matching departments' : 'No departments yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first department to organize your team'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-[#0048a1] hover:bg-[#003d8b]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Department
                </Button>
              )}
            </motion.div>
          ) : (
            filteredDepartments.map((department, index) => (
              <DepartmentCard 
                key={department.id} 
                department={department} 
                stats={getDepartmentStats(department)}
                onSelect={setSelectedDepartment}
                onDelete={handleDeleteDepartment}
                delay={index * 0.1}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Department Dialog */}
      <AddDepartmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddDepartment={handleAddDepartment}
        staff={staff}
      />
    </div>
  );
}
