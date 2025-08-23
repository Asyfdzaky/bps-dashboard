import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react'; // Add this import
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;

    // Filter items based on user permissions
    const filteredItems = items.filter((item) => {
        // Manajemen Role hanya untuk role manajer
        if (item.href === '/manajemen-role') {
            return user?.roles?.includes('manajer') || false;
        }

        // Manajemen Tim dan Manajemen Pengguna juga hanya untuk role manajer
        if (item.href === '/manajemen-tim' || item.href === '/manajemen-pengguna') {
            return user?.roles?.includes('manajer') || false;
        }

        // Allow other items
        return true;
    });

    return (
        <SidebarGroup {...props} className={`group-data-[collapsible-0]:p-0 ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {filteredItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={page.url.startsWith(item.href)}
                                tooltip={{ children: item.title }}
                                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
