"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Divider,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useSnackbar } from "../../components/useSnackbar";
import CustomSnackbar from "../../components/CustomSnackbar";

type Booking = {
  id: number;
  room: {
    name: string;
  };
  department: {
    name: string;
  };
  startTime: string;
  endTime: string;
  status: string;
  observation?: string;
  phone?: string;
  isActive: boolean;
  user: { name: string };
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{ [key: number]: string }>(
    {}
  );
  const [observationUpdate, setObservationUpdate] = useState<{
    [key: number]: string;
  }>({});
  const [phoneUpdate, setPhoneUpdate] = useState<{ [key: number]: string }>({});
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const { openSnackbar, snackbarProps } = useSnackbar();

  useEffect(() => {
    const fetchBookings = async () => {
      const res = await fetch("/api/agendamentos");
      const data = await res.json();
      setBookings(data);
    };

    fetchBookings();
  }, []);

  const handleUpdate = async (id: number) => {
    const newStatus = statusUpdate[id];
    const newObservation = observationUpdate[id];
    const newPhone = phoneUpdate[id];

    const res = await fetch(`/api/agendamento/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
        observation: newObservation,
        phone: newPhone,
      }),
    });

    if (res.ok) {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id
            ? {
                ...booking,
                status: newStatus || booking.status,
                observation: newObservation || booking.observation,
                phone: newPhone || booking.phone,
              }
            : booking
        )
      );
      openSnackbar("Atualizações salvas com sucesso!", "success");
      setEditMode((prev) => ({ ...prev, [id]: false }));
    } else {
      openSnackbar("Erro ao salvar as atualizações.", "warning");
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Administração de Agendamentos
        </Typography>
        <Grid container spacing={2}>
          {bookings.map((booking) => (
            <Grid item xs={12} sm={6} md={4} key={booking.id}>
              <List>
                <ListItem
                  onClick={() =>
                    setExpanded(expanded === booking.id ? null : booking.id)
                  }
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <ListItemText
                    primary={booking.room.name}
                    secondary={`${new Date(
                      booking.startTime
                    ).toLocaleDateString()} - ${booking.department.name}`}
                  />
                  <IconButton
                    onClick={() =>
                      setExpanded(expanded === booking.id ? null : booking.id)
                    }
                  >
                    {expanded === booking.id ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                </ListItem>
                <Collapse
                  in={expanded === booking.id}
                  timeout="auto"
                  unmountOnExit
                >
                  <Box p={2} border={1} borderRadius={4} mb={2}>
                    <Typography variant="subtitle1" gutterBottom>
                      Detalhes do Agendamento
                    </Typography>
                    <Divider />
                    <Typography>Solicitante: {booking.user.name}</Typography>
                    <Typography>
                      Telefone:{" "}
                      {editMode[booking.id] ? (
                        <TextField
                          value={phoneUpdate[booking.id] || booking.phone || ""}
                          onChange={(e) =>
                            setPhoneUpdate({
                              ...phoneUpdate,
                              [booking.id]: e.target.value,
                            })
                          }
                          fullWidth
                        />
                      ) : (
                        booking.phone || "N/A"
                      )}
                    </Typography>
                    <Box mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Status
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={statusUpdate[booking.id] || booking.status}
                          onChange={(e) =>
                            setStatusUpdate({
                              ...statusUpdate,
                              [booking.id]: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="pending">Pendente</MenuItem>
                          <MenuItem value="approved">Aprovado</MenuItem>
                          <MenuItem value="cancelled">Cancelado</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Observações
                      </Typography>
                      <TextField
                        value={
                          observationUpdate[booking.id] ||
                          booking.observation ||
                          ""
                        }
                        onChange={(e) =>
                          setObservationUpdate({
                            ...observationUpdate,
                            [booking.id]: e.target.value,
                          })
                        }
                        multiline
                        rows={3}
                        variant="outlined"
                        fullWidth
                      />
                    </Box>
                    <Box mt={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdate(booking.id)}
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() =>
                          setEditMode({
                            ...editMode,
                            [booking.id]: !editMode[booking.id],
                          })
                        }
                      >
                        {editMode[booking.id] ? "Cancelar" : "Editar"}
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </List>
            </Grid>
          ))}
        </Grid>
      </Container>
      <CustomSnackbar {...snackbarProps} />
    </ProtectedRoute>
  );
};

export default AdminBookings;
