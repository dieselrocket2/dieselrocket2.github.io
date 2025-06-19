
import React, { useState, useEffect } from "react";
import { Staff, Role } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Search, 
  Filter,
  Users,
  Mail,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import StaffFilters from "../components/staff/StaffFilters";
import StaffCard from "../components/staff/StaffCard";
import AddStaffDialog from "../components/staff/AddStaffDialog";

export default function StaffDirectory() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "all",
    status: "all",
    role: "all"
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [staff, searchTerm, filters]);

  const loadData = async () => {
    try {
      const [staffData, rolesData] = await Promise.all([
        Staff.list('-created_date'),
        Role.list()
      ]);
      setStaff(staffData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...staff];

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(person =>
        person.first_name?.toLowerCase().includes(search) ||
        person.last_name?.toLowerCase().includes(search) ||
        person.email?.toLowerCase().includes(search) ||
        person.department?.toLowerCase().includes(search) ||
        person.employee_id?.toLowerCase().includes(search)
      );
    }

    // Apply filters
    if (filters.department !== "all") {
      filtered = filtered.filter(person => person.department === filters.department);
    }
    if (filters.status !== "all") {
      filtered = filtered.filter(person => person.status === filters.status);
    }
    if (filters.role !== "all") {
      filtered = filtered.filter(person => person.role_id === filters.role);
    }

    setFilteredStaff(filtered);
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      await Staff.delete(staffId);
      await loadData(); // Reload data to reflect the deletion
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleAddStaff = async (staffData) => {
    try {
      await Staff.create(staffData);
      await loadData();
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Directory</h1>
          <p className="text-slate-600 mt-1">
            Manage your team members and their information
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-[#0048a1] hover:bg-[#003d8b] text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Staff
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search staff by name, email, department, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus:border-[#0048a1] focus:ring-[#0048a1]/20"
          />
        </div>
        <StaffFilters 
          filters={filters}
          setFilters={setFilters}
          staff={staff}
          roles={roles}
        />
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Showing {filteredStaff.length} of {staff.length} staff members</span>
        </div>
        {searchTerm && (
          <Badge variant="outline" className="bg-[#0048a1]/10 text-[#0048a1] border-[#0048a1]/20">
            Search: "{searchTerm}"
          </Badge>
        )}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredStaff.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No staff found</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || Object.values(filters).some(f => f !== "all")
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first staff member"
                }
              </p>
              {!searchTerm && Object.values(filters).every(f => f === "all") && (
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-[#0048a1] hover:bg-[#003d8b]"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Staff Member
                </Button>
              )}
            </motion.div>
          ) : (
            filteredStaff.map((person, index) => (
              <StaffCard 
                key={person.id} 
                staff={person} 
                roles={roles}
                delay={index * 0.05}
                onDelete={handleDeleteStaff} // Pass the onDelete handler
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Staff Dialog */}
      <AddStaffDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddStaff={handleAddStaff}
        roles={roles}
      />
    </div>
  );
}
