import { BookOpen, Bot, Gpu, Settings2, SquareTerminal } from 'lucide-react';
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react';
import { NavMain } from '@/components/NavMain';
import { NavUser } from '@/components/NavUser';
import { TeamSwitcher } from './team-switcher';

// This is sample data
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Nvision AI',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Defect Checker',
      url: '#scan-data',
      icon: SquareTerminal,
      isActive: true,
      // items: [
      //   {
      //     title: 'Heatmap',
      //     url: '#heatmap',
      //   },
      //   {
      //     title: 'List view',
      //     url: '#list-view',
      //   },
      // ],
    },
    {
      title: 'Data Collection',
      url: '#data-collection',
      icon: Gpu,
      items: [],
    },
    {
      title: 'Past Data',
      url: '#past-data',
      icon: Bot,
      items: [],
    },
    {
      title: 'Summary',
      url: '#summary',
      icon: BookOpen,
      items: [],
    },
    // {
    //   title: 'Past error logs',
    //   url: '#past-error-logs',
    //   icon: BookOpen,
    //   items: [],
    // },
    {
      title: 'App settings',
      url: '#settings',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#settings-general',
        },
        {
          title: 'Pattern EBC',
          url: '#pattern-EBC',
        },
        {
          title: 'Team',
          url: '#settings-team',
        },
        {
          title: 'Billing',
          url: '#settings-billing',
        },
      ],
    },
  ],
};

const AppSidebar = ({
  handleLogout,
  ...props
}: React.ComponentProps<typeof Sidebar> & { handleLogout: () => void }) => {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="top-8 h-[calc(100vh-32px)]"
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} handleLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
