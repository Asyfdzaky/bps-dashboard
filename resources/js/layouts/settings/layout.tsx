import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading title="Settings" description="Manage your profile and account settings" />

            {/* Horizontal Tab Navigation */}
            <div className="mt-6">
                <nav className="flex space-x-8 border-b border-gray-200">
                    {sidebarNavItems.map((item, index) => (
                        <Button
                            key={`${item.href}-${index}`}
                            variant="ghost"
                            asChild
                            className={cn({
                                'border-blue-600 text-blue-600': currentPath === item.href,
                                'text-gray-500': currentPath !== item.href,
                            })}
                        >
                            <Link href={item.href} prefetch className="flex items-center space-x-2">
                                {item.icon && <item.icon className="h-4 w-4" />}
                                <span>{item.title}</span>
                            </Link>
                        </Button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="mt-8">
                <section className="max-h-screen space-y-12">{children}</section>
            </div>
        </div>
    );
}
