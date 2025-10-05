import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { router } from '@inertiajs/react';
import { Calendar as CalendarIcon, CalendarPlus, CheckCircle, User, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
type CalendarStatus = 'proses' | 'selesai' | 'mendekati-deadline';

type CalendarEvent = {
    id?: string | number;
    title: string;
    pic_name?: string;
    start: string;
    end?: string;
    status: CalendarStatus;
    description?: string;
    allDay?: boolean;
    source?: string;
    created_by?: string;
};

type User = {
    user_id: string;
    nama_lengkap: string;
};

type NewEventForm = {
    title: string;
    description: string;
    start: string;
    end: string;
    status: CalendarStatus;
    pic_name: string;
    allDay: boolean;
    pic_user_id: string | null;
};

const STATUS_BG: Record<CalendarStatus, string> = {
    proses: 'var(--fc-event-bg-proses)',
    selesai: 'var(--fc-event-bg-selesai)',
    'mendekati-deadline': 'var(--fc-event-bg-mendekati-deadline)',
};
const STATUS_BORDER: Record<CalendarStatus, string> = {
    proses: 'var(--fc-event-border-proses)',
    selesai: 'var(--fc-event-border-selesai)',
    'mendekati-deadline': 'var(--fc-event-border-mendekati-deadline)',
};
const STATUS_TEXT: Record<CalendarStatus, string> = {
    proses: 'var(--fc-event-text-proses)',
    selesai: 'var(--fc-event-text-selesai)',
    'mendekati-deadline': 'var(--fc-event-text-mendekati-deadline)',
};
const STATUS_BADGE_CLASS = (status: CalendarStatus): string => {
    switch (status) {
        case 'proses':
            return 'border border-orange-500 text-orange-800 bg-transparent';
        case 'selesai':
            return 'border border-green-500 text-green-800 bg-transparent';
        case 'mendekati-deadline':
            return 'border border-red-500 text-red-800 bg-transparent';
        default:
            return 'border border-gray-400 text-gray-700 bg-transparent';
    }
};
const STATUS_LABEL: Record<CalendarStatus, string> = {
    proses: 'Sedang Berlangsung',
    selesai: 'Selesai',
    'mendekati-deadline': 'Mendekati Deadline',
};

export default function Calendar({
    flash,
    events,
    users = [],
}: {
    events: CalendarEvent[];
    users?: User[];
    flash?: { success?: string; error?: string };
}) {
    const [open, setOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [clicked, setClicked] = useState<{
        title: string;
        startStr: string;
        endStr?: string;
        status: CalendarStatus;
        description?: string;
        pic_name?: string;
        source?: string;
        created_by?: string;
    } | null>(null);

    const [newEvent, setNewEvent] = useState<NewEventForm>({
        title: '',
        description: '',
        start: '',
        end: '',
        status: 'proses',
        pic_name: '',
        allDay: true,
        pic_user_id: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        show: false,
        message: '',
        type: 'success',
    });
    // Auto-hide notification after 5 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification((prev) => ({ ...prev, show: false }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    // Show notification from flash messages
    useEffect(() => {
        if (flash?.success) {
            showNotification(flash.success, 'success');
        }
    }, [flash]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({
            show: true,
            message,
            type,
        });
    };

    const hideNotification = () => {
        setNotification((prev) => ({ ...prev, show: false }));
    };

    // Map props -> event FullCalendar + pewarnaan
    const fcEvents = useMemo<EventInput[]>(
        () =>
            (events ?? []).map((e) => ({
                id: e.id?.toString(),
                title: e.title,
                start: e.start,
                end: e.end,
                allDay: e.allDay ?? true,
                backgroundColor: STATUS_BG[e.status],
                borderColor: STATUS_BORDER[e.status],
                textColor: STATUS_TEXT[e.status],
                extendedProps: {
                    status: e.status,
                    description: e.description,
                    pic_name: e.pic_name,
                    source: e.source,
                    created_by: e.created_by,
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
            pic_name: (arg.event.extendedProps?.pic_name as string) ?? undefined,
            source: (arg.event.extendedProps?.source as string) ?? undefined,
            created_by: (arg.event.extendedProps?.created_by as string) ?? undefined,
        });
        setOpen(true);
    };

    const onDateSelect = (selectInfo: DateSelectArg) => {
        const startDate = selectInfo.start;
        const endDate = selectInfo.end;

        // Format dates for input fields
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = new Date(endDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        setNewEvent((prev) => ({
            ...prev,
            start: startStr,
            end: endStr,
            allDay: selectInfo.allDay,
        }));

        setSheetOpen(true);
        selectInfo.view.calendar.unselect();
    };

    const handleInputChange = (field: keyof NewEventForm, value: string | boolean | null) => {
        setNewEvent((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePicUserChange = (userId: string) => {
        if (userId === 'none') {
            setNewEvent((prev) => ({
                ...prev,
                pic_user_id: null,
                pic_name: '',
            }));
            return;
        }
        const selectedUser = users.find((user) => user.user_id === userId);
        if (selectedUser) {
            setNewEvent((prev) => ({
                ...prev,
                pic_user_id: selectedUser.user_id,
                pic_name: selectedUser.nama_lengkap,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newEvent.title.trim()) {
            alert('Judul kegiatan harus diisi');
            return;
        }

        setIsSubmitting(true);

        try {
            router.post(
                '/calendar/events',
                {
                    title: newEvent.title,
                    description: newEvent.description,
                    start: newEvent.start,
                    end: newEvent.end,
                    status: newEvent.status,
                    pic_name: newEvent.pic_name,
                    all_day: newEvent.allDay,
                    pic_user_id: newEvent.pic_user_id,
                },
                {
                    onSuccess: () => {
                        setNewEvent({
                            title: '',
                            description: '',
                            start: '',
                            end: '',
                            status: 'proses',
                            pic_name: '',
                            allDay: true,
                            pic_user_id: null,
                        });
                        setSheetOpen(false);
                        showNotification('Kegiatan berhasil ditambahkan.');
                    },
                    onError: (errors) => {
                        showNotification('Gagal menambahkan kegiatan. Silakan coba lagi. ' + errors);
                    },
                    onFinish: () => setIsSubmitting(false),
                },
            );
        } catch (error) {
            showNotification('Terjadi kesalahan saat mengirim data. Silakan coba lagi.' + error);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Notification Toast */}
            {notification.show && (
                <div className="fixed top-4 right-4 z-50 animate-in fade-in-0 slide-in-from-top-5">
                    <Alert
                        className={`min-w-80 border-l-4 shadow-lg ${
                            notification.type === 'success' ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-500 bg-red-50 text-red-800'
                        }`}
                    >
                        <CheckCircle className={`h-4 w-4 ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
                        <AlertTitle className="flex items-center justify-between">
                            {notification.type === 'success' ? 'Berhasil!' : 'Error!'}
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-transparent" onClick={hideNotification}>
                                <X className="h-4 w-4" />
                            </Button>
                        </AlertTitle>
                        <AlertDescription className="mt-1">{notification.message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-foreground">Kalender Kegiatan</h1>
                        <p className="text-sm text-muted-foreground">Kelola jadwal dan pantau progres kegiatan Anda</p>
                    </div>
                    <Button onClick={() => setSheetOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                        <CalendarPlus className="h-4 w-4" />
                        Tambah Kegiatan
                    </Button>
                </div>

                <div className="rounded-lg border bg-card p-8">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
                        }}
                        buttonText={{
                            today: 'Hari Ini',
                            month: 'Bulan',
                            week: 'Minggu',
                            day: 'Hari',
                            list: 'Daftar',
                        }}
                        views={{
                            listMonth: { buttonText: 'Daftar' },
                        }}
                        events={fcEvents}
                        eventClick={onEventClick}
                        selectable={true}
                        selectMirror={true}
                        select={onDateSelect}
                        height="75vh"
                        locale="id"
                        dayMaxEvents={3}
                        moreLinkText="lainnya"
                    />
                </div>
            </div>

            {/* Detail Event Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            {clicked?.title ?? 'Detail Kegiatan'}
                        </DialogTitle>
                        {clicked?.description && (
                            <DialogDescription className="text-sm text-muted-foreground">{clicked.description}</DialogDescription>
                        )}
                    </DialogHeader>

                    <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2">
                        {/* Status */}
                        {clicked?.status && (
                            <>
                                <span className="text-sm font-medium text-muted-foreground">Status</span>
                                <Badge className={STATUS_BADGE_CLASS(clicked.status)}>{STATUS_LABEL[clicked.status]}</Badge>
                            </>
                        )}

                        {/* Tanggal Mulai */}
                        <span className="text-sm font-medium text-muted-foreground">Mulai</span>
                        <span className="text-sm">{clicked?.startStr ?? '-'}</span>

                        {/* Tanggal Selesai */}
                        {clicked?.endStr && (
                            <>
                                <span className="text-sm font-medium text-muted-foreground">Selesai</span>
                                <span className="text-sm">{clicked.endStr}</span>
                            </>
                        )}

                        {/* PIC */}
                        {clicked?.pic_name && (
                            <>
                                <span className="text-sm font-medium text-muted-foreground">PIC</span>
                                <span className="text-sm">{clicked.pic_name}</span>
                            </>
                        )}

                        {/* Dibuat oleh */}
                        {clicked?.created_by && (
                            <>
                                <span className="text-sm font-medium text-muted-foreground">Dibuat oleh</span>
                                <span className="text-sm">{clicked.created_by}</span>
                            </>
                        )}

                        {/* Deskripsi */}
                        {clicked?.description && (
                            <>
                                <span className="text-sm font-medium text-muted-foreground">Deskripsi</span>
                                <span className="text-sm">{clicked.description}</span>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Event Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-[450px] overflow-y-auto p-3 sm:max-w-[450px]">
                    <SheetHeader className="space-y-2 pb-6">
                        <SheetTitle className="flex items-center gap-2 text-xl">
                            <CalendarPlus className="h-5 w-5 text-primary" />
                            Tambah Kegiatan Baru
                        </SheetTitle>
                        <SheetDescription>Isi form di bawah untuk menambahkan kegiatan baru ke kalender</SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-muted-foreground">Informasi Kegiatan</h4>

                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-medium">
                                    Judul Kegiatan *
                                </Label>
                                <Input
                                    id="title"
                                    value={newEvent.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Masukkan judul kegiatan"
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">
                                    Deskripsi
                                </Label>
                                <Textarea
                                    id="description"
                                    value={newEvent.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Masukkan deskripsi kegiatan"
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-medium">
                                    Status
                                </Label>
                                <Select value={newEvent.status} onValueChange={(value) => handleInputChange('status', value as CalendarStatus)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="proses">Sedang Berlangsung</SelectItem>
                                        <SelectItem value="selesai">Selesai</SelectItem>
                                        <SelectItem value="mendekati-deadline">Mendekati Deadline</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-muted-foreground">Tanggal & Waktu</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start" className="text-sm font-medium">
                                        Tanggal Mulai *
                                    </Label>
                                    <Input
                                        id="start"
                                        type="date"
                                        value={newEvent.start}
                                        onChange={(e) => handleInputChange('start', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end" className="text-sm font-medium">
                                        Tanggal Selesai
                                    </Label>
                                    <Input id="end" type="date" value={newEvent.end} onChange={(e) => handleInputChange('end', e.target.value)} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="allDay" className="text-sm font-medium">
                                    Sepanjang Hari
                                </Label>
                                <Switch id="allDay" checked={newEvent.allDay} onCheckedChange={(checked) => handleInputChange('allDay', checked)} />
                            </div>
                        </div>

                        {/* PIC Information */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-muted-foreground">Person in Charge (PIC)</h4>

                            <div className="space-y-2">
                                <Label htmlFor="pic_user" className="text-sm font-medium">
                                    Pilih PIC
                                </Label>
                                <Select value={newEvent.pic_user_id || 'none'} onValueChange={handlePicUserChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih PIC (opsional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak ada PIC</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.user_id} value={user.user_id}>
                                                {user.nama_lengkap}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pic_name" className="text-sm font-medium">
                                    Nama PIC
                                </Label>
                                <Input
                                    id="pic_name"
                                    value={newEvent.pic_name}
                                    onChange={(e) => handleInputChange('pic_name', e.target.value)}
                                    placeholder="Masukkan nama PIC atau pilih dari dropdown di atas"
                                    disabled={!!newEvent.pic_user_id}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 border-t pt-6">
                            <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} disabled={isSubmitting} className="px-6">
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-primary px-6 hover:bg-primary/90">
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Kegiatan'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}
