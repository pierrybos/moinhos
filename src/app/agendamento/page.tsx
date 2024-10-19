"use client";
import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

export default function Schedule() {
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [observation, setObservation] = useState("");

  useEffect(() => {
    fetch("/api/salas")
      .then((res) => res.json())
      .then((data) => setRooms(data));
    fetch("/api/departamentos")
      .then((res) => res.json())
      .then((data) => setDepartments(data));
  }, []);

  const handleBooking = async () => {
    await fetch("/api/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: selectedRoom,
        departmentId: selectedDepartment,
        startTime,
        endTime,
        observation, // Incluindo o campo de observação
        userId: "userId from session",
      }),
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agendar Sala</h1>

      <div className="flex space-x-4 mb-4">
        <FormControl className="flex-1">
          <InputLabel>Sala</InputLabel>
          <Select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            {rooms.map((room) => (
              <MenuItem key={room.id} value={room.id}>
                {room.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className="flex-1">
          <InputLabel>Departamento</InputLabel>
          <Select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {departments.map((department) => (
              <MenuItem key={department.id} value={department.id}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="flex space-x-4 mb-4">
        <TextField
          label="Data e Hora de Início"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="flex-1"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Data e Hora de Fim"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="flex-1"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>

      <div className="flex space-x-4 mb-4">
        <TextField
          label="Observações"
          multiline
          rows={4}
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          className="flex-1"
          variant="outlined"
        />
      </div>

      <Button variant="contained" color="primary" onClick={handleBooking}>
        Agendar
      </Button>
    </div>
  );
}
