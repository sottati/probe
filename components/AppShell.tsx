"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { SurveyStatus } from "@/lib/types";

export type SurveyNavItem = {
  id: string;
  title: string;
  status: SurveyStatus;
};

export function AppShell({
  children,
  surveys,
}: {
  children: React.ReactNode;
  surveys: SurveyNavItem[];
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
                <span className="text-base font-semibold tracking-tight">probe</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Surveys</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {surveys.map((survey) => (
                  <SidebarMenuItem key={survey.id}>
                    <SidebarMenuButton
                      isActive={pathname === `/surveys/${survey.id}`}
                      render={<Link href={`/surveys/${survey.id}`} />}
                      tooltip={survey.title}
                    >
                      <span className="truncate">{survey.title}</span>
                      <Badge
                        variant={survey.status === "published" ? "default" : "secondary"}
                        className="ml-auto shrink-0 text-[10px]"
                      >
                        {survey.status}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {surveys.length === 0 ? (
                  <p className="px-2 py-1 text-xs text-muted-foreground">No surveys yet.</p>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/surveys/new" />}>
                <PlusIcon />
                <span>New survey</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <Button variant="outline" size="sm" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
