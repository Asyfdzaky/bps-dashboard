import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useMemo, useState } from 'react';

type CalendarStatus = 'proses' | 'selesai' | 'mendekati-deadline';

type CalendarEvent = {
    id?: string | number;
    title: string;
    tahap: number;
    task_name: string;
    pic_name: string;
    start: string;
    end?: string;
    status: CalendarStatus;
    description?: string;
    allDay?: boolean;
};

const STATUS_COLOR: Record<CalendarStatus, string> = {
    proses: '#f59e0b',
    selesai: '#10b981',
    'mendekati-deadline': '#ef4444',
};

const STATUS_BADGE_CLASS = (status: CalendarStatus): string => {
    switch (status) {
        case 'proses':
            return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'selesai':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'mendekati-deadline':
            return 'bg-red-100 text-red-700 border-red-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default function Calendar({ events }: { events: CalendarEvent[] }) {
    const [open, setOpen] = useState(false);
    const [clicked, setClicked] = useState<{
        title: string;
        startStr: string;
        endStr?: string;
        status: CalendarStatus;
        description?: string;
        tahap: number;
        task_name: string;
        pic_name: string;
    } | null>(null);

    // Map props -> event FullCalendar + pewarnaan
    const fcEvents = useMemo<EventInput[]>(
        () =>
            (events ?? []).map((e) => ({
                id: e.id?.toString(),
                title: e.title,
                start: e.start,
                end: e.end,
                allDay: e.allDay ?? true,
                color: STATUS_COLOR[e.status],
                extendedProps: {
                    status: e.status,
                    description: e.description,
                    tahap: e.tahap,
                    task_name: e.task_name,
                    pic_name: e.pic_name,
                },
            })),
        [events],
    );

    const onEventClick = (arg: EventClickArg) => {
        const status = (arg.event.extendedProps?.status ?? 'proses') as CalendarStatus;
        setClicked({
            title: arg.event.title,
            startStr: arg.event.startStr,
            endStr: arg.event.endStr || undefined,
            status,
            description: (arg.event.extendedProps?.description as string | undefined) ?? undefined,
            tahap: (arg.event.extendedProps?.tahap as number) ?? 0,
            task_name: (arg.event.extendedProps?.task_name as string) ?? '',
            pic_name: (arg.event.extendedProps?.pic_name as string) ?? '',
        });
        setOpen(true);
    };

    return (
        <>
            <div className="p-6">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
                    }}
                    buttonText={{
                        today: 'Today',
                        month: 'Month',
                        week: 'Week',
                        day: 'Day',
                        list: 'List',
                    }}
                    views={{
                        listMonth: { buttonText: 'List' },
                    }}
                    events={fcEvents}
                    eventClick={onEventClick}
                    height="80vh"
                />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{clicked?.title ?? 'Detail Event'}</DialogTitle>
                        {clicked?.description ? <DialogDescription>{clicked.description}</DialogDescription> : null}
                    </DialogHeader>

                    <div className="mt-2 space-y-2 text-sm">
                        {clicked?.status ? (
                            <div className="flex items-center gap-2">
                                <span>Status:</span>
                                <Badge className={STATUS_BADGE_CLASS(clicked.status)}>{clicked.status}</Badge>
                            </div>
                        ) : null}
                        <div className="flex items-center gap-2">
                            <span>Mulai:</span>
                            <span>{clicked?.startStr ?? '-'}</span>
                        </div>
                        {clicked?.endStr ? (
                            <div className="flex items-center gap-2">
                                <span>Selesai:</span>
                                <span>{clicked.endStr}</span>
                            </div>
                        ) : null}
                        {clicked?.tahap ? (
                            <div className="flex items-center gap-2">
                                <span>Tahap:</span>
                                <span>{clicked.tahap}</span>
                            </div>
                        ) : null}
                        {clicked?.task_name ? (
                            <div className="flex items-center gap-2">
                                <span>Tugas:</span>
                                <span>{clicked.task_name}</span>
                            </div>
                        ) : null}
                        {clicked?.pic_name ? (
                            <div className="flex items-center gap-2">
                                <span>PIC:</span>
                                <span>{clicked.pic_name}</span>
                            </div>
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
