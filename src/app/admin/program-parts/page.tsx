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
  TextField,
  IconButton,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ProtectedRoute from "@/app/components/ProtectedRoute";

type ProgramPart = {
  id: number;
  name: string;
  isActive: boolean;
};

const AdminProgramParts = () => {
  const [programParts, setProgramParts] = useState<ProgramPart[]>([]);
  const [newPart, setNewPart] = useState("");
  const [editingPart, setEditingPart] = useState<ProgramPart | null>(null);

  const fetchProgramParts = async () => {
    try {
      const response = await fetch("/api/program-parts");
      const data = await response.json();
      setProgramParts(data);
    } catch (error) {
      console.error("Erro ao carregar os momentos do programa:", error);
    }
  };

  useEffect(() => {
    fetchProgramParts();
  }, []);

  const handleAddPart = async () => {
    if (!newPart.trim()) {
      alert("O nome o momento do programa não pode estar vazio.");
      return;
    }

    try {
      const response = await fetch("/api/program-parts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newPart }),
      });

      if (response.ok) {
        fetchProgramParts();
        setNewPart("");
        alert("Parte do programa adicionada com sucesso!");
      } else {
        alert("Erro ao adicionar o momento do programa.");
      }
    } catch (error) {
      console.error("Erro ao adicionar o momento do programa:", error);
    }
  };

  const handleUpdatePart = async (part: ProgramPart) => {
    try {
      const response = await fetch("/api/program-parts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: part.id,
          name: part.name,
          isActive: part.isActive,
        }),
      });

      if (response.ok) {
        fetchProgramParts();
        setEditingPart(null);
        alert("Momento do programa atualizado com sucesso!");
      } else {
        alert("Erro ao atualizar o momento do programa.");
      }
    } catch (error) {
      console.error("Erro ao atualizar o momento do programa:", error);
    }
  };

  const handleDeletePart = async (id: number) => {
    const confirmDelete = confirm(
      "Tem certeza que deseja deletar este momento do programa?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/program-parts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchProgramParts();
        alert("Momento do programa removido com sucesso!");
      } else {
        alert("Erro ao remover o momento do programa.");
      }
    } catch (error) {
      console.error("Erro ao remover o momento do programa:", error);
    }
  };

  return (
    <ProtectedRoute>
      <Container
        maxWidth="md"
        sx={{
          backgroundColor: "background.default",
          color: "text.primary",
          padding: 3,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          Momentos da Programação
        </Typography>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          marginBottom={2}
          sx={{
            backgroundColor: "background.paper",
            padding: 2,
            borderRadius: 1,
          }}
        >
          <TextField
            label="Novo Momento"
            value={newPart}
            onChange={(e) => setNewPart(e.target.value)}
            fullWidth
            sx={{
              "& .MuiInputBase-input": {
                color: "text.primary",
              },
              "& .MuiInputLabel-root": {
                color: "text.secondary",
              },
            }}
          />
          <Button variant="contained" color="primary" onClick={handleAddPart}>
            Adicionar
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "background.paper",
            boxShadow: 1,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "text.primary" }}>Nome</TableCell>
                <TableCell sx={{ color: "text.primary" }}>Ativo</TableCell>
                <TableCell sx={{ color: "text.primary" }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell sx={{ color: "text.primary" }}>
                    {editingPart?.id === part.id ? (
                      <TextField
                        value={editingPart.name}
                        onChange={(e) =>
                          setEditingPart({
                            ...editingPart,
                            name: e.target.value,
                          })
                        }
                        fullWidth
                        sx={{
                          "& .MuiInputBase-input": {
                            color: "text.primary",
                          },
                          "& .MuiInputLabel-root": {
                            color: "text.secondary",
                          },
                        }}
                      />
                    ) : (
                      part.name
                    )}
                  </TableCell>
                  <TableCell sx={{ color: "text.primary" }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={part.isActive}
                          onChange={() =>
                            handleUpdatePart({
                              ...part,
                              isActive: !part.isActive,
                            })
                          }
                          color="primary"
                        />
                      }
                      label={part.isActive ? "Ativo" : "Inativo"}
                      sx={{
                        color: "text.primary",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {editingPart?.id === part.id ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdatePart(editingPart)}
                      >
                        Salvar
                      </Button>
                    ) : (
                      <>
                        <IconButton onClick={() => setEditingPart(part)}>
                          <EditIcon sx={{ color: "text.secondary" }} />
                        </IconButton>
                        <IconButton onClick={() => handleDeletePart(part.id)}>
                          <DeleteIcon sx={{ color: "text.secondary" }} />
                        </IconButton>
                      </>
                    )}
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

export default AdminProgramParts;
