// src/utils/authUtils.ts
export const checkRole = (user, requiredRole) => {
  const userRole = user?.role;
  const roles = ["default", "manager", "admin"]; // Ordem de permissões
  return roles.indexOf(userRole as string) >= roles.indexOf(requiredRole);
};

export const isAdmin = (user) => {
  return checkRole(user, "admin");
};
