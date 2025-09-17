import { useState } from "react";
import { 
  Users, 
  Calendar, 
  BookOpen, 
  Building, 
  MessageSquare, 
  BarChart3, 
  Settings,
  GraduationCap,
  QrCode,
  CreditCard,
  Bell,
  User,
  LogOut
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  student_id?: string;
  department?: string;
  year?: number;
  phone?: string;
  avatar_url?: string;
  hostel_id?: string;
  room_number?: string;
}

interface AppSidebarProps {
  user: User;
  onLogout: () => void;
}

const studentMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Attendance", url: "/attendance", icon: QrCode },
  { title: "Library", url: "/library", icon: BookOpen },
  { title: "Hostel", url: "/hostel", icon: Building },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Complaints", url: "/complaints", icon: MessageSquare },
  { title: "Profile", url: "/profile", icon: User },
];

const teacherMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Attendance", url: "/attendance", icon: QrCode },
  { title: "Students", url: "/students", icon: Users },
  { title: "Library", url: "/library", icon: BookOpen },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Profile", url: "/profile", icon: User },
];

const adminMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Users", url: "/users", icon: Users },
  { title: "Attendance", url: "/attendance", icon: QrCode },
  { title: "Library", url: "/library", icon: BookOpen },
  { title: "Hostel", url: "/hostel", icon: Building },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Complaints", url: "/complaints", icon: MessageSquare },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const getMenuItems = () => {
    switch (user.role) {
      case "admin":
        return adminMenuItems;
      case "teacher":
        return teacherMenuItems;
      default:
        return studentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => currentPath === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-soft" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "teacher":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 p-4">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg shadow-soft">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-sidebar-foreground">Smart Campus</h1>
              <p className="text-xs text-sidebar-foreground/60">Management System</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!collapsed ? "Main Menu" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => `${getNavClass({ isActive })} transition-all duration-200`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="text-sidebar-foreground/60">Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                    <Badge variant="destructive" className="ml-auto">3</Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {user.role === "student" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <CreditCard className="h-4 w-4" />
                      <span>Payments</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-medium">
              {user.full_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.full_name}
                </p>
                <Badge variant={getRoleBadgeColor(user.role)} className="text-xs">
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user.email}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}