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

// Tipo para os dados dos usuários
type User = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Função para buscar a lista de usuários
    const fetchUsers = async () => {
      const res = await fetch("/api/getUsers");
      const data = await res.json();
      setUsers(data.users);
    };

    fetchUsers();
  }, []);

  // Função para alterar o status de administrador do usuário
  const handleAdminToggle = async (userId: number, isAdmin: boolean) => {
    const res = await fetch(`/api/updateUser`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId, isAdmin }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, isAdmin } : user))
      );
      alert("Permissão atualizada com sucesso!");
    } else {
      alert("Erro ao atualizar a permissão.");
    }
  };

  return (
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
                        checked={user.isAdmin}
                        onChange={(e) =>
                          handleAdminToggle(user.id, e.target.checked)
                        }
                      />
                    }
                    label={user.isAdmin ? "Sim" : "Não"}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleAdminToggle(user.id, !user.isAdmin)}
                  >
                    {user.isAdmin ? "Remover Admin" : "Tornar Admin"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UserManagement;
