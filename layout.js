
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  BarChart3,
  Shield,
  Calendar,
  Database,
  Building2,
  Menu,
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User } from "@/entities/User";
import AccessControl from "../components/auth/AccessControl";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
    type: "item"
  },
  {
    title: "Staff Directory",
    url: createPageUrl("StaffDirectory"),
    icon: Users,
    type: "item"
  },
  {
    title: "Time Off",
    url: createPageUrl("TimeOff"),
    icon: Calendar,
    type: "item"
  },
  {
    title: "Databases",
    url: createPageUrl("Databases"),
    icon: Database,
    type: "item"
  },
  {
    title: "Organization",
    icon: Building2,
    type: "group",
    items: [
      {
        title: "Departments",
        url: createPageUrl("Departments"),
        icon: Building2,
      },
      {
        title: "Role Management",
        url: createPageUrl("RoleManagement"),
        icon: Shield,
      }
    ]
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [expandedGroups, setExpandedGroups] = React.useState({});

  React.useEffect(() => {
    loadUser();
    // Auto-expand groups that contain the current page
    const currentGroup = navigationItems.find(item =>
      item.type === "group" &&
      item.items?.some(subItem => location.pathname === subItem.url)
    );
    if (currentGroup) {
      setExpandedGroups(prev => ({ ...prev, [currentGroup.title]: true }));
    }
  }, [location.pathname]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = async () => {
    await User.logout();
  };

  const toggleGroup = (groupTitle) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5eb376735_IMG_7586.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">REC Hub</h2>
            <p className="text-sm text-slate-500">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            if (item.type === "group") {
              const isExpanded = expandedGroups[item.title];
              const hasActiveChild = item.items?.some(subItem =>
                location.pathname === subItem.url
              );

              return (
                <div key={item.title}>
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(item.title)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                      hasActiveChild
                        ? 'bg-[#0048a1]/10 text-[#0048a1]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 transition-transform duration-200 ${
                        hasActiveChild ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                    )}
                  </button>

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="mt-1 ml-4 space-y-1">
                      {item.items.map((subItem) => {
                        const isActive = location.pathname === subItem.url;
                        return (
                          <Link
                            key={subItem.title}
                            to={subItem.url}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group ${
                              isActive
                                ? 'bg-[#0048a1] text-white shadow-lg'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <subItem.icon className={`w-4 h-4 transition-transform duration-200 ${
                              isActive ? 'scale-110' : 'group-hover:scale-105'
                            }`} />
                            <span className="font-medium text-sm">{subItem.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
              // Regular navigation item
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#0048a1] text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            }
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 bg-[#0048a1]/10 rounded-xl">
          <div className="w-8 h-8 bg-[#0048a1]/20 rounded-full flex items-center justify-center">
            <span className="text-[#0048a1] font-semibold text-sm">
              {user?.full_name?.[0] || user?.email?.[0] || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 text-sm truncate">
              {user?.full_name || 'System Admin'}
            </p>
            <p className="text-xs text-slate-500 truncate">System Administrator</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="opacity-70 hover:opacity-100 transition-opacity"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <AccessControl>
      <div className="min-h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72 lg:overflow-y-auto lg:bg-white lg:border-r lg:border-slate-200">
          <SidebarContent />
        </div>

        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-m-2.5 p-2.5">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5eb376735_IMG_7586.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-bold text-slate-900">REC Hub</span>
          </div>
        </div>

        {/* Main Content */}
        <main className="lg:pl-72">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </AccessControl>
  );
}
