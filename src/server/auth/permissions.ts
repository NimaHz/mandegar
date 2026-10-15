import { type AdminIdentity, type Permission, permissions, type UserRole } from "@/types/admin";

const rolePermissions: Record<UserRole, readonly Permission[]> = {
  owner: permissions,
  editor: [
    "dashboard:read",
    "catalog:read",
    "catalog:write",
    "content:read",
    "content:write",
    "media:read",
    "media:write",
    "warranty:read",
    "warranty:write",
  ],
  support: [
    "dashboard:read",
    "catalog:read",
    "tickets:read",
    "tickets:write",
    "messages:read",
    "messages:write",
  ],
};

const permissionsFor = (role: UserRole): Permission[] => [...rolePermissions[role]];

export const hasPermission = (role: UserRole, permission: Permission) =>
  rolePermissions[role].includes(permission);

export const toIdentity = (user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  totpEnabled: boolean;
  mustChangePassword: boolean;
}): AdminIdentity => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  totpEnabled: user.totpEnabled,
  mustChangePassword: user.mustChangePassword,
  permissions: permissionsFor(user.role),
});
