// app/admin/users/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ProtectedRoute from "@/app/components/ProtectedRoute";

// Tipo para os dados dos usuários
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Função para buscar a lista de usuários
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users);
    };

    fetchUsers();
  }, []);

  // Função para alterar o papel do usuário
  const handleRoleToggle = async (userId: number, newRole: string) => {
    const res = await fetch(`/api/users`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId, role: newRole }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
      alert("Permissão atualizada com sucesso!");
    } else {
      alert("Erro ao atualizar a permissão.");
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Gerenciamento de Usuários
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Administrador</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "Nome não disponível"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.role === "admin"}
                          onChange={(e) =>
                            handleRoleToggle(user.id, e.target.checked ? "admin" : "default")
                          }
                        />
                      }
                      label={user.role === "admin" ? "Sim" : "Não"}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        handleRoleToggle(user.id, user.role === "admin" ? "default" : "admin")
                      }
                    >
                      {user.role === "admin" ? "Remover Admin" : "Tornar Admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ProtectedRoute>
  );
};

export default UserManagement;
