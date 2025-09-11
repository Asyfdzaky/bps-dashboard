// utils/roles.ts
export const hasRole = (user?: { roles?: string[] }, role?: string | string[]) => {
    if (!user?.roles) return false;
    if (!role) return true;
    return Array.isArray(role) ? role.some((r) => user.roles!.includes(r)) : user.roles.includes(role);
};
