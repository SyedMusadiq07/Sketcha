"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import {
  Archive,
  Files,
  LayoutGrid,
  Settings,
  Sparkle,
  Users,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function AppSidebar() {
  const path = usePathname();
  const {user} = useUser()
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          <h2 className="text-xl font-bold">Sketcha</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Button>+ Create New Board</Button>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>My Boards</SidebarGroupLabel>
          <SidebarMenuSubButton className="p-5" isActive={path == "/dashboard"}>
            <LayoutGrid />
            <span>All files</span>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton
            className="p-5 mt-2"
            isActive={path == "/shared-files"}
          >
            <Users />
            <span>Shared</span>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton className="p-5" isActive={path == "/archive"}>
            <Archive />
            <span>Archive</span>
          </SidebarMenuSubButton>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Others</SidebarGroupLabel>
          <SidebarMenuSubButton
            className="p-5 mt-2"
            isActive={path == "/settings"}
          >
            <Settings />
            <span>Settings</span>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton className="p-5" isActive={path == "/ai"}>
            <Sparkle />
            <span>AI Helper</span>
          </SidebarMenuSubButton>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button>+ Create New Board</Button>
        <div className="p-4 my-3 border rounded-md">
          <h2 className="text-sm flex justify-between mb-1">
            2 files created <span>total 3</span>
          </h2>
          <Progress value={66} className="mt-2 h2"></Progress>
        </div>
        <div className="flex items-center gap-2 bg-background border rounded-md p-1">
          {user?.imageUrl && <Image src={user?.imageUrl} alt="User Image" width={40} height={40} className="rounded-full"/>}
          <div>
            <h2>{user?.firstName} {user?.lastName}</h2>
            <h3 className="text-sm text-muted-foreground">Admin</h3>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
