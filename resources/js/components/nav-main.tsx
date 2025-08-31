import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMain({
    items = [],
    title,
    icon,
    defaultOpen = true,
    collapsible = false,
}: {
    items: NavItem[];
    title: string;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
    collapsible?: boolean;
}) {
    const page = usePage();
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const { state, isMobile, openMobile } = useSidebar();

    useEffect(() => {
        if (state === 'collapsed') {
            setIsOpen(false);
        }
    }, [state]);

    useEffect(() => {
        if (isMobile || !openMobile) {
            setIsOpen(false);
        }
    }, [isMobile, openMobile]);

    // Check if any item in this group is currently active
    const isGroupActive = items.some((item) => page.url.startsWith(item.href));

    const toggleGroup = () => {
        if (collapsible) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel
                className={`${collapsible ? 'cursor-pointer rounded-md transition-colors hover:bg-sidebar-accent/50' : ''} ${isGroupActive ? 'text-sidebar-accent-foreground' : ''}`}
                onClick={toggleGroup}
            >
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-gray-600">{icon}</span>}
                        <h3 className="text-sm font-medium">{title}</h3>
                    </div>
                    {collapsible && (
                        <span className="ml-auto">
                            {isOpen ? (
                                <ChevronDown className="h-3 w-3 transition-transform" />
                            ) : (
                                <ChevronRight className="h-3 w-3 transition-transform" />
                            )}
                        </span>
                    )}
                </div>
            </SidebarGroupLabel>

            {/* Collapsible Content */}
            <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="relative ml-3 pl-3">
                    {/* Vertical line */}
                    <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-300" />

                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </div>
            </div>
        </SidebarGroup>
    );
}
