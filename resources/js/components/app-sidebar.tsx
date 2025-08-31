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
import { FileText, LayoutGrid, Shield, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Naskah',
        href: '/manajemen-naskah',
        icon: FileText,
    },
];
const ManajemenPenggunaNavItems: NavItem[] = [
    {
        title: 'Manajemen Role',
        href: '/manajemen-role',
        icon: Shield,
    },
    {
        title: 'Manajemen Tim',
        href: '/manajemen-tim',
        icon: Users,
    },
    {
        title: 'Manajemen Pengguna',
        href: '/manajemen-pengguna',
        icon: Users,
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
                        <NavMain items={mainNavItems} title="Menu Utama" collapsible icon={<LayoutGrid className="h-4 w-4" />} />
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
