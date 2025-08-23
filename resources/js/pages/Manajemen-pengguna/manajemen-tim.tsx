import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Tim',
        href: '/manajemen-tim',
    },
];
export default function ManajemenTim() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Tim" />
            <div>Manajemen Tim</div>
        </AppLayout>
    );
}
