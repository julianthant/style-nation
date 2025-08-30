'use client';

import {
  BarChart3,
  Car,
  ChevronRight,
  Facebook,
  Home,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { SearchForm } from '@/components/search-form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

// Admin navigation data
const adminNavData = {
  mainNav: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
    },
  ],
  sections: [
    {
      title: 'Car Management',
      items: [
        {
          title: 'All Cars',
          url: '/dashboard/cars',
          icon: Car,
        },
        {
          title: 'Add New Car',
          url: '/dashboard/cars/create',
          icon: Car,
        },
        {
          title: 'Car Analytics',
          url: '/dashboard/cars/analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Customer Management',
      items: [
        {
          title: 'Inquiries',
          url: '/dashboard/inquiries',
          icon: MessageSquare,
        },
        {
          title: 'Customers',
          url: '/dashboard/customers',
          icon: Users,
        },
      ],
    },
    {
      title: 'Analytics & Reports',
      items: [
        {
          title: 'Overview',
          url: '/dashboard/analytics',
          icon: BarChart3,
        },
        {
          title: 'Sales Reports',
          url: '/dashboard/analytics/sales',
          icon: BarChart3,
        },
        {
          title: 'Performance',
          url: '/dashboard/analytics/performance',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Marketing',
      items: [
        {
          title: 'Facebook Posts',
          url: '/dashboard/facebook',
          icon: Facebook,
        },
        {
          title: 'Social Analytics',
          url: '/dashboard/facebook/analytics',
          icon: Facebook,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          title: 'Admin Users',
          url: '/dashboard/users',
          icon: Users,
        },
        {
          title: 'Settings',
          url: '/dashboard/settings',
          icon: Settings,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="font-bold text-xl">🚗</div>
          <div>
            <h2 className="font-semibold text-lg">Style Nation</h2>
            <p className="text-muted-foreground text-xs">Admin Panel</p>
          </div>
        </div>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* Main navigation items (Dashboard) */}
        <SidebarGroup>
          <SidebarMenu>
            {adminNavData.mainNav.map(item => {
              const IconComponent = item.icon;
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url}>
                      <IconComponent className="w-4 h-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Collapsible sections */}
        {adminNavData.sections.map(section => (
          <Collapsible
            key={section.title}
            title={section.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label hover:bg-sidebar-accent text-sidebar-foreground text-sm hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  {section.title}
                  <ChevronRight className="ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map(item => {
                      const IconComponent = item.icon;
                      const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link href={item.url}>
                              <IconComponent className="w-4 h-4" />
                              {item.title}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
