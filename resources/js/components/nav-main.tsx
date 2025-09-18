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
    const { state } = useSidebar(); // { open, collapsed }
    const isCollapsed = state === 'collapsed';

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [hasBeenManuallyClosed, setHasBeenManuallyClosed] = useState(false);

    const isGroupActive = useMemo(() => items.some((item) => page.url.startsWith(item.href)), [items, page.url]);

    const shouldBeCollapsible = collapsible && items.length > 1;

    // Tutup paksa saat sidebar collapsed
    useEffect(() => {
        if (isCollapsed) {
            setIsOpen(false);
            // jangan tandai "manually closed" — ini state UI karena collapsed
        }
    }, [isCollapsed]);

    // Auto-open kalau ada item aktif (kecuali saat collapsed)
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

    // === Single item: biarkan seperti sebelumnya (sudah bagus & tooltip jalan saat collapsed)
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
                                tooltip={{ children: item.title }} // tooltip muncul saat collapsed
                            >
                                <Link href={item.href} prefetch>
                                    <div className="flex items-center gap-2">
                                        {icon && <span>{icon}</span>}
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

    // === Multiple items
    return (
        <SidebarGroup className="px-2 py-0">
            {/* Saat COLLAPSED: render header sebagai SidebarMenuButton agar tooltip & icon-only bekerja */}
            {isCollapsed ? (
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: title }}
                                className="h-auto p-2" // Match the padding/height of SidebarGroupLabel
                            >
                                <div className="flex items-center gap-2">
                                    {icon && <span>{icon}</span>} {/* TAMBAHKAN text-gray-600 */}
                                    {/* Use the same text styling as SidebarGroupLabel */}
                                    <span className="">{title}</span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            ) : (
                <>
                    {/* Expanded state: pakai label clickable + chevron */}
                    <SidebarGroupLabel
                        className={`${shouldBeCollapsible ? 'cursor-pointer transition-colors hover:text-primary' : ''} ${isGroupActive ? 'text-sm font-medium' : ''}`}
                        onClick={toggleGroup}
                    >
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                                {icon && <span>{icon}</span>} {/* Sudah ada text-gray-600 */}
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

                    {/* Konten group: JANGAN render saat collapsed */}
                    {(!shouldBeCollapsible || isOpen) && (
                        <div className="max-h-screen overflow-hidden opacity-100 transition-all duration-200 ease-in-out">
                            <div className="relative ml-3 pl-3">
                                {/* Vertical line */}
                                <div className="absolute top-0 bottom-0 left-0 w-px bg-secondary/50" />
                                <SidebarMenu>
                                    {items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                                                <Link href={item.href} prefetch>
                                                    <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2">
                                                        <span>{item.title}</span>
                                                    </div>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </div>
                        </div>
                    )}
                </>
            )}
        </SidebarGroup>
    );
}
