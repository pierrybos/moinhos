"use client";
import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/departamentos")
      .then((res) => res.json())
      .then((data) => setDepartments(data));
  }, []);

  const fetchDepartments = async () => {
    const res = await fetch("/api/departamentos");
    const data = await res.json();
    setDepartments(data);
  };

  const handleCreate = async () => {
    await fetch("/api/departamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    fetchDepartments(); // Recarregar a lista de departamentos
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/departamentos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchDepartments(); // Recarregar a lista de departamentos
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Departamentos</h1>

      <div className="flex space-x-4 mb-4">
        <TextField
          label="Nome do Departamento"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Criar Departamento
        </Button>
      </div>

      <List>
        {Array.isArray(departments) && departments.length > 0 ? (
          departments.map((department) => (
            <ListItem
              key={department.id}
              className="bg-white shadow-lg rounded-lg mb-4 flex justify-between"
            >
              <ListItemText primary={department.name} />
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(department.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))
        ) : (
          <p>Nenhum departamento encontrado.</p>
        )}
      </List>
    </div>
  );
}
