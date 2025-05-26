import { BookOpen, Bot, Settings2, SquareTerminal } from 'lucide-react';
import  React from 'react'
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
      name: 'Acme Inc',
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
      title: 'Scan Data',
      url: '#scan-data',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Heatmap',
          url: '#heatmap',
        },
        {
          title: 'List view',
          url: '#list-view',
        },
      ],
    },
    {
      title: 'QR Generator',
      url: '#qr-generator',
      icon: Bot,
      items: [],
    },
    {
      title: 'Printers',
      url: '#printers',
      icon: BookOpen,
      items: [],
    },
    {
      title: 'Settings',
      url: '#settings',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#settings-general',
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

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="icon" {...props} className='my-10'>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
