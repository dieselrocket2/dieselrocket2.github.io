import React, { useState, useEffect } from "react";
import { Database as DatabaseEntity, DatabaseTable, DatabaseRow, Staff } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Database, 
  Table, 
  Users, 
  Eye,
  Edit,
  Trash2,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import DatabaseCard from "../components/databases/DatabaseCard";
import CreateDatabaseDialog from "../components/databases/CreateDatabaseDialog";
import DatabaseView from "../components/databases/DatabaseView";

export default function Databases() {
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser] = useState({ id: "current_user", email: "admin@company.com" }); // Mock user

  useEffect(() => {
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    try {
      const databasesData = await DatabaseEntity.list('-created_date');
      setDatabases(databasesData);
    } catch (error) {
      console.error('Error loading databases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDatabase = async (databaseData) => {
    try {
      await DatabaseEntity.create({
        ...databaseData,
        created_by: currentUser.id,
        permissions: {
          view: [currentUser.id],
          edit: [currentUser.id],
          delete: [currentUser.id]
        }
      });
      await loadDatabases();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating database:', error);
    }
  };

  const handleDeleteDatabase = async (databaseId) => {
    try {
      // Delete all related tables and rows first
      const tables = await DatabaseTable.filter({ database_id: databaseId });
      for (const table of tables) {
        const rows = await DatabaseRow.filter({ table_id: table.id });
        for (const row of rows) {
          await DatabaseRow.delete(row.id);
        }
        await DatabaseTable.delete(table.id);
      }
      await DatabaseEntity.delete(databaseId);
      await loadDatabases();
      if (selectedDatabase?.id === databaseId) {
        setSelectedDatabase(null);
      }
    } catch (error) {
      console.error('Error deleting database:', error);
    }
  };

  const hasPermission = (database, permission) => {
    return database.permissions?.[permission]?.includes(currentUser.id) || 
           database.created_by === currentUser.id;
  };

  const stats = {
    total: databases.length,
    canView: databases.filter(db => hasPermission(db, 'view')).length,
    canEdit: databases.filter(db => hasPermission(db, 'edit')).length,
    canDelete: databases.filter(db => hasPermission(db, 'delete')).length
  };

  if (selectedDatabase) {
    return (
      <DatabaseView 
        database={selectedDatabase}
        onBack={() => setSelectedDatabase(null)}
        currentUser={currentUser}
        hasPermission={hasPermission}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Databases</h1>
          <p className="text-slate-600 mt-1">
            Manage custom databases with tables, columns, and permissions
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-[#0048a1] hover:bg-[#003d8b] text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Database
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#0048a1]/10 rounded-xl">
                <Database className="w-6 h-6 text-[#0048a1]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-600">Total Databases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.canView}</p>
                <p className="text-sm text-slate-600">Can View</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Edit className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.canEdit}</p>
                <p className="text-sm text-slate-600">Can Edit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.canDelete}</p>
                <p className="text-sm text-slate-600">Can Delete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Databases Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Your Databases</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card className="p-6 border-0 shadow-lg">
