"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

type Booking = {
  id: number;
  room: { name: string };
  department: { name: string };
  startTime: string;
  endTime: string;
  status: string;
  observation?: string;
};

const UserBookings = () => {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (session?.user) {
        const res = await fetch("/api/agendamentos", {
          method: "GET",
          credentials: "include", // Certifique-se de incluir cookies
        });
        const data = await res.json();
        setBookings(data);
      }
    };

    fetchBookings();
  }, [session]);

  const handleExpandToggle = (id: number) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return {
          color: "#388e3c",
          border: "1px solid #388e3c",
          backgroundColor: "#e8f5e9",
        };
      case "cancelled":
        return {
          color: "#d32f2f",
          border: "1px solid #d32f2f",
          backgroundColor: "#ffebee",
        };
      case "pending":
      default:
        return {
          color: "#616161",
          border: "1px solid #616161",
          backgroundColor: "#f5f5f5",
        };
    }
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom>
          Meus Agendamentos
        </Typography>
        <List>
          {bookings.length === 0 ? (
            <Typography>Você ainda não fez nenhum agendamento.</Typography>
          ) : (
            bookings.map((booking) => (
              <ListItem
                key={booking.id}
                onClick={() => handleExpandToggle(booking.id)}
              >
                <ListItemText
                  primary={booking.room.name}
                  secondary={`${new Date(
                    booking.startTime
                  ).toLocaleDateString()} - ${booking.department.name}`}
                />
                <Chip
                  label={booking.status}
                  size="small"
                  sx={{
                    ...getStatusStyle(booking.status),
                    marginLeft: "10px",
                  }}
                />
                <IconButton onClick={() => handleExpandToggle(booking.id)}>
                  {expanded === booking.id ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
                <Collapse
                  in={expanded === booking.id}
                  timeout="auto"
                  unmountOnExit
                >
                  <Box p={2} border={1} borderRadius={4} mt={2}>
                    <Typography variant="subtitle1">
                      Detalhes do Agendamento
                    </Typography>
                    <Divider />
                    <Typography>
                      Data de Início:{" "}
                      {new Date(booking.startTime).toLocaleString()}
                    </Typography>
                    <Typography>
                      Data de Fim: {new Date(booking.endTime).toLocaleString()}
                    </Typography>
                    <Typography>
                      Departamento: {booking.department.name}
                    </Typography>
                    <Typography mt={2}>
                      Observações: {booking.observation || "Sem observações"}
                    </Typography>
                  </Box>
                </Collapse>
              </ListItem>
            ))
          )}
        </List>
      </Container>
    </ProtectedRoute>
  );
};

export default UserBookings;
