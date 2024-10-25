// src/utils/authUtils.ts
type User = {
  role?: string;
};

export const checkRole = (user: User, requiredRole: string): boolean => {
  const userRole = user?.role;
  const roles = ["default", "manager", "admin"]; // Ordem de permissões
  return roles.indexOf(userRole as string) >= roles.indexOf(requiredRole);
};

export const isAdmin = (user: User) => {
  return checkRole(user, "admin");
};
