import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { hasRole } from '@/types/access';
import { Link, usePage } from '@inertiajs/react';
import { BarChart, BookOpen, Calendar, FileText, LayoutGrid, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];
const NaskahNavItems: NavItem[] = [
    {
        title: 'Bank Naskah',
        href: '/manajemen-naskah',
    },
    {
        title: 'Progres',
        href: '/progres-naskah',
    },
    {
        title: 'Approval Naskah',
        href: '/approval',
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
    const { auth } = usePage<{ auth: { user?: { roles?: string[] } } }>().props;
    const user = auth.user;
    const { state } = useSidebar(); // Get sidebar state
    const isCollapsed = state === 'collapsed';
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex items-center justify-center">
                    <Link href="/dashboard" className="flex items-center justify-center">
                        {isCollapsed ? (
                            // Show book icon when collapsed
                            <BookOpen className="h-6 w-6 text-primary" />
                        ) : (
                            // Show full logo when expanded
                            <AppLogo />
                        )}
                    </Link>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Menu Utama (semua bisa lihat) */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <NavMain items={mainNavItems} title="Menu Utama" icon={<LayoutGrid className="h-4 w-4" />} />
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Naskah (manajer/produksi/penerbit) */}
                {hasRole(user, ['manajer', 'produksi', 'penerbit']) && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <NavMain items={NaskahNavItems} title="Naskah" collapsible icon={<FileText className="h-4 w-4" />} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* Analitik (manajer saja) */}
                {hasRole(user, ['manajer', 'produksi', 'penerbit']) && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <NavMain items={AnalitikNavItems} title="Analitik" collapsible icon={<BarChart className="h-4 w-4" />} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* Kalender (semua role) */}
                {hasRole(user, ['manajer', 'produksi', 'penerbit']) && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <NavMain items={KalenderNavItems} title="Kalender" collapsible icon={<Calendar className="h-4 w-4" />} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* Manajemen Pengguna (manajer saja) */}
                {hasRole(user, 'manajer') && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <NavMain items={ManajemenPenggunaNavItems} title="Manajemen Pengguna" collapsible icon={<Users className="h-4 w-4" />} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
