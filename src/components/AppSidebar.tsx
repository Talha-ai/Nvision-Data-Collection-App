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
      url: '#defect-checker',
      icon: SquareTerminal,
      isActive: true,
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
          url: '#pattern-ebc',
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
  onNavigate,
  activePage,
  username,
  ...props
}: React.ComponentProps<typeof Sidebar> & { handleLogout: () => void; onNavigate: (page: string) => void; activePage: string; username?: string }) => {
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
        <NavMain items={data.navMain} onNavigate={onNavigate} activePage={activePage} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: username || data.user.name,
          email: data.user.email,
          avatar: '',
        }} handleLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
