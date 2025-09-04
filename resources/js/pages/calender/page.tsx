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
    tahap: number;
    task_name: string;
    pic_name: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Calender', href: '/calender' }];

export default function Calender() {
    const { events } = usePage<{ events: CalendarEvent[] }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calender" />
            <Calendar events={events} />
        </AppLayout>
    );
}
