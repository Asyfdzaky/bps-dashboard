import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [hasBeenManuallyClosed, setHasBeenManuallyClosed] = useState(false);

    const isGroupActive = useMemo(() => items.some((item) => page.url.startsWith(item.href)), [items, page.url]);
    const shouldBeCollapsible = collapsible && items.length > 1;

    // Close when sidebar is collapsed
    useEffect(() => {
        if (isCollapsed) {
            setIsOpen(false);
        }
    }, [isCollapsed]);

    // Auto-open when group has active item (except when collapsed)
    useEffect(() => {
        if (!isCollapsed && isGroupActive && !isOpen && !hasBeenManuallyClosed) {
            setIsOpen(true);
        }
    }, [isCollapsed, isGroupActive, isOpen, hasBeenManuallyClosed]);

    const toggleGroup = () => {
        if (shouldBeCollapsible && !isCollapsed) {
            const next = !isOpen;
            setIsOpen(next);
            setHasBeenManuallyClosed(!next);
        }
    };

    // Single item navigation
    if (items.length === 1) {
        const item = items[0];
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={page.url.startsWith(item.href)}
                                tooltip={isCollapsed ? { children: title } : undefined}
                                className="h-7 px-3 text-sm font-medium"
                            >
                                <Link href={item.href} prefetch>
                                    <div className="flex w-full items-center gap-3">
                                        {icon && (
                                            <span
                                                className={`flex-shrink-0 transition-colors duration-200 ${page.url.startsWith(item.href) ? 'text-sidebar-foreground' : 'text-sidebar-foreground/60'} `}
                                            >
                                                {icon}
                                            </span>
                                        )}
                                        <span className="truncate">{title}</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    // Multiple items navigation
    return (
        <SidebarGroup>
            {isCollapsed ? (
                // Collapsed state: show as single menu button with tooltip
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip={{ children: title }}
                                isActive={isGroupActive}
                                className="h-7 justify-center px-3 data-[state=collapsed]:justify-center"
                            >
                                <div className="flex items-center justify-center">
                                    {icon && <span className="flex-shrink-0 text-sidebar-foreground">{icon}</span>}
                                    <span className="sr-only">{title}</span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            ) : (
                // Expanded state: show group label and sub-items
                <>
                    <SidebarGroupLabel
                        className={`mx-0 flex h-9 items-center rounded-md px-3 transition-all duration-200 ${
                            shouldBeCollapsible ? 'cursor-pointer hover:bg-primary/60 hover:text-black' : 'cursor-default'
                        } ${isGroupActive ? 'text-sm' : 'text-sm font-medium'} `}
                        onClick={toggleGroup}
                    >
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3">
                                {icon && (
                                    <span
                                        className={`flex-shrink-0 transition-colors duration-200 ${isGroupActive ? 'text-foreground/70' : 'text-foreground/70'} `}
                                    >
                                        {icon}
                                    </span>
                                )}
                                <span className="truncate text-black">{title}</span>
                            </div>
                            {shouldBeCollapsible && (
                                <span className="ml-2 flex-shrink-0 opacity-60 transition-opacity hover:opacity-100">
                                    {isOpen ? (
                                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                                    )}
                                </span>
                            )}
                        </div>
                    </SidebarGroupLabel>

                    {/* Sub-items container with better animation */}
                    <SidebarGroupContent
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            !shouldBeCollapsible || isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        } `}
                    >
                        <div className="mt-1 ml-6 border-l border-sidebar-border pl-3">
                            <SidebarMenu className="gap-1">
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={page.url.startsWith(item.href)}
                                            tooltip={isCollapsed ? { children: item.title } : undefined}
                                            className="h-8 px-3 text-sm font-medium"
                                        >
                                            <Link href={item.href} prefetch>
                                                <div className="flex w-full items-center">
                                                    <span className="truncate">{item.title}</span>
                                                </div>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </div>
                    </SidebarGroupContent>
                </>
            )}
        </SidebarGroup>
    );
}
