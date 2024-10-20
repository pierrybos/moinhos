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

interface Room {
  id: number;
  name: string;
  capacity: number;
}

export default function ManageRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);  // Define rooms como um array de Room
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    fetch("/api/salas")
      .then((res) => res.json())
      .then((data) => setRooms(data));
  }, []);

  const fetchRooms = async () => {
    const res = await fetch("/api/salas");
    const data = await res.json();
    setRooms(data);
  };

  const handleCreate = async () => {
    await fetch("/api/salas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, capacity: parseInt(capacity) }),
    });
    setName("");
    setCapacity("");
    fetchRooms(); // Recarregar a lista de salas
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/salas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchRooms(); // Recarregar a lista de salas
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Salas</h1>

      <div className="flex space-x-4 mb-4">
        <TextField
          label="Nome da Sala"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <TextField
          label="Capacidade"
          type="number"
          variant="outlined"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="flex-1"
        />
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Criar Sala
        </Button>
      </div>

      <List>
        {rooms.map((room) => (
          <ListItem
            key={room.id}
            className="bg-white shadow-lg rounded-lg mb-4 flex justify-between"
          >
            <ListItemText
              primary={room.name}
              secondary={`Capacidade: ${room.capacity} pessoas`}
            />
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => handleDelete(room.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
}
