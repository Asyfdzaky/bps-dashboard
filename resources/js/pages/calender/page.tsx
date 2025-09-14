import Calendar from '@/components/calender';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

type CalendarStatus = 'proses' | 'selesai' | 'mendekati-deadline';

type CalendarEvent = {
    id?: string | number;
    title: string;
    start: string;
    end?: string;
    status: CalendarStatus;
    description?: string;
    allDay?: boolean;
    pic_name?: string;
    source?: string;
    created_by?: string;
};

type User = {
    user_id: string;
    nama_lengkap: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Calender', href: '/calender' }];

export default function Calender() {
    const { events, users } = usePage<{
        events: CalendarEvent[];
        users: User[];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calender" />
            <Calendar events={events} users={users} />
        </AppLayout>
    );
}
