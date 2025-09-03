import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
// import { Badge } from './ui/badge';

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
    const [hasBeenManuallyClosed, setHasBeenManuallyClosed] = useState(false);
    const isGroupActive = items.some((item) => page.url.startsWith(item.href));
    const shouldBeCollapsible = collapsible && items.length > 1;

    // Auto-open if any item is active
    useEffect(() => {
        if (isGroupActive && !isOpen && !hasBeenManuallyClosed) {
            setIsOpen(true);
        }
    }, [isGroupActive, isOpen, hasBeenManuallyClosed]);

    const toggleGroup = () => {
        if (shouldBeCollapsible) {
            const newState = !isOpen;
            setIsOpen(newState);

            if (!newState) {
                setHasBeenManuallyClosed(true);
            } else {
                setHasBeenManuallyClosed(false);
            }
        }
    };

    // Jika hanya 1 item, render langsung sebagai single menu item
    if (items.length === 1) {
        const item = items[0];
        return (
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    <div className="flex items-center gap-2">
                                        {icon && <span className="text-gray-600">{icon}</span>}
                                        <span>{item.title}</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    // Jika multiple items, render sebagai collapsible group
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel
                className={`${shouldBeCollapsible ? 'cursor-pointer rounded-md transition-colors hover:bg-sidebar-accent/50' : ''} ${isGroupActive ? 'text-sidebar-accent-foreground' : ''}`}
                onClick={toggleGroup}
            >
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-gray-600">{icon}</span>}
                        <h3 className="text-sm font-medium">{title}</h3>
                    </div>
                    {shouldBeCollapsible && (
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
            <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    shouldBeCollapsible ? (isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0') : 'max-h-screen opacity-100'
                }`}
            >
                <div className="relative ml-3 pl-3">
                    {/* Vertical line */}
                    <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-300" />

                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2">
                                            <span>{item.title}</span>
                                            {/* <Badge variant={'outline'}>9</Badge> */}
                                        </div>
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
