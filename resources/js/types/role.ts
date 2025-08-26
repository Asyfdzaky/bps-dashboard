// resources/js/types/app.ts
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

export type Permission = {
    id: number;
    name: string;
};

export type RoleRow = {
    id: number;
    name: string;
    guard_name: string;
    permissions_count: number;
    created_at: string;
};

export type RoleIndexFilters = {
    q?: string;
    sort?: 'name' | 'guard_name' | 'permissions_count' | 'created_at';
    dir?: 'asc' | 'desc';
    perPage?: number;
    page?: number;
};

export type RoleIndexCan = {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
};

export type RoleIndexPageProps = {
    roles: Paginated<RoleRow>;
    filters: RoleIndexFilters;
    can: RoleIndexCan;
    permissions: Permission[];
};
