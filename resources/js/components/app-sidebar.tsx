import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BarChart, Calendar, FileText, LayoutGrid, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];
const NaskahNavItems: NavItem[] = [
    {
        title: 'Naskah',
        href: '/manajemen-naskah',
    },
    {
        title: 'Progres',
        href: '/progres-naskah',
    },
];
const ManajemenPenggunaNavItems: NavItem[] = [
    {
        title: 'Manajemen Role',
        href: '/manajemen-role',
    },
    {
        title: 'Manajemen Tim',
        href: '/manajemen-tim',
    },
    {
        title: 'Manajemen Pengguna',
        href: '/manajemen-pengguna',
    },
];
const AnalitikNavItems: NavItem[] = [
    {
        title: 'Analitik',
        href: '/analitik',
    },
    {
        title: 'Target',
        href: '/target',
    },
];
const KalenderNavItems: NavItem[] = [
    {
        title: 'Kalender',
        href: '/calender',
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation Group */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <NavMain items={mainNavItems} title="Menu Utama" icon={<LayoutGrid className="h-4 w-4" />} />
                    </SidebarGroupContent>
                </SidebarGroup>
                {/* Naskah Group */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <NavMain items={NaskahNavItems} title="Naskah" collapsible icon={<FileText className="h-4 w-4" />} />
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Analitik Group */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <NavMain items={AnalitikNavItems} title="Analitik" collapsible icon={<BarChart className="h-4 w-4" />} />
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Kalender Group */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <NavMain items={KalenderNavItems} title="Kalender" collapsible icon={<Calendar className="h-4 w-4" />} />
                    </SidebarGroupContent>
                </SidebarGroup>
                {/* Management Group */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <NavMain items={ManajemenPenggunaNavItems} title="Manajemen Pengguna" collapsible icon={<Users className="h-4 w-4" />} />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
