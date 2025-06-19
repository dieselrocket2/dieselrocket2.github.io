
import React, { useState, useEffect } from "react";
import { Role } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Users, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import RoleCard from "../components/roles/RoleCard";
import AddRoleDialog from "../components/roles/AddRoleDialog";

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const rolesData = await Role.list('level');
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = async (roleData) => {
    try {
      await Role.create(roleData);
      await loadRoles();
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const handleUpdateRole = async (roleId, roleData) => {
    try {
      await Role.update(roleId, roleData);
      await loadRoles();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await Role.delete(roleId);
      await loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Role Management</h1>
          <p className="text-slate-600 mt-1">
            Define custom roles and manage permissions for your team
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-[#0048a1] hover:bg-[#003d8b] text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Role
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{roles.length}</p>
                <p className="text-sm text-slate-600">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {roles.reduce((sum, role) => sum + (role.permissions?.length || 0), 0)}
                </p>
                <p className="text-sm text-slate-600">Total Permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.max(...roles.map(r => r.level || 1), 0)}
                </p>
                <p className="text-sm text-slate-600">Hierarchy Levels</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">All Roles</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card className="p-6 border-0 shadow-lg">
                    <div className="space-y-4">
                      <div className="h-6 bg-slate-200 rounded w-1/2" />
                      <div className="h-5 bg-slate-200 rounded w-8" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                    </div>
                  </Card>
                </div>
              ))
            ) : roles.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <Shield className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No roles defined yet</h3>
                <p className="text-slate-600 mb-6">
                  Create your first role to start organizing your team's permissions
                </p>
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-[#0048a1] hover:bg-[#003d8b]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Role
                </Button>
              </motion.div>
            ) : (
              roles.map((role, index) => (
                <RoleCard 
                  key={role.id} 
                  role={role} 
                  onUpdate={handleUpdateRole}
                  onDelete={handleDeleteRole}
                  delay={index * 0.1}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Role Dialog */}
      <AddRoleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddRole={handleAddRole}
      />
    </div>
  );
}
