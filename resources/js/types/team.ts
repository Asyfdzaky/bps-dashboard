export type UserRow = {
    user_id: string;
    nama_lengkap: string;
    email: string;
    foto_profil_url?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
};

export type Role = {
    id: number;
    name: string;
};

export type TeamIndexFilters = {
    q?: string;
    sort?: 'nama_lengkap' | 'email' | 'created_at';
    dir?: 'asc' | 'desc';
    perPage?: number;
    page?: number;
};

export type TeamIndexCan = {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
};

export type TeamIndexPageProps = {
    users: Paginated<UserRow>;
    filters: TeamIndexFilters;
    roles: Role[];
    can: TeamIndexCan;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from?: number | null;
    to?: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};
