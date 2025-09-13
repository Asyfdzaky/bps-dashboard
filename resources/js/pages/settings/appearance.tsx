import { Head, usePage } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import AppHeaderLayout from '@/layouts/app-user-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { hasRole } from '@/types/access';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Settings',
        href: '/settings',
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    const { auth } = usePage<{ auth: { user?: { roles?: string[] } } }>().props;
    const user = auth.user;
    const isPenulis = hasRole(user, ['penulis', 'penejemah']);

    const content = (
        <div className="space-y-6">
            <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
            <AppearanceTabs />
        </div>
    );

    // If user is penulis, use AppHeaderLayout
    if (isPenulis) {
        return (
            <AppHeaderLayout>
                <Head title="Appearance settings" />
                <SettingsLayout>{content}</SettingsLayout>
            </AppHeaderLayout>
        );
    } else {
        // Default layout for other roles
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Appearance settings" />
                <SettingsLayout>{content}</SettingsLayout>
            </AppLayout>
        );
    }
}
