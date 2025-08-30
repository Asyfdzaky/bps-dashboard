export interface Publisher {
    penerbit_id: number;
    nama_penerbit: string;
    deskripsi_segmen?: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
}

export interface UserRow {
    user_id: string;
    nama_lengkap: string;
    email: string;
    roles: Role[];
    publisher?: Publisher | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedUsers {
    data: UserRow[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

export interface Filters {
    page?: number;
    q?: string;
    sort?: string;
    dir?: 'asc' | 'desc';
}

export interface Permissions {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
}

export interface PageProps {
    [key: string]: unknown;
}

export interface TeamIndexPageProps extends PageProps {
    users: PaginatedUsers;
    roles: Role[];
    publishers: Publisher[];
    filters: Filters;
    can: Permissions;
}
