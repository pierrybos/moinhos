// app/view-uploads/page.tsx
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
  Chip,
  Box,
} from "@mui/material";

// Tipo para os dados dos participantes
type Participant = {
  id: number;
  name: string;
  group: string;
  participationDate: string;
  programPart: string;
  status: string;
  files: {
    id: number;
    filename: string;
    driveLink: string;
  }[];
};

const ViewUploads = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    // Função para buscar os dados dos participantes e arquivos
    const fetchParticipants = async () => {
      const res = await fetch("/api/getParticipants");
      const data = await res.json();
      setParticipants(data.participants);
    };

    fetchParticipants();
  }, []);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Arquivos Enviados
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Igreja/Grupo/Estado</TableCell>
              <TableCell>Data de Participação</TableCell>
              <TableCell>Parte do Programa</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Arquivos</TableCell>
              <TableCell>Obs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell>{participant.name}</TableCell>
                <TableCell>{participant.group}</TableCell>
                <TableCell>
                  {new Date(participant.participationDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{participant.programPart}</TableCell>
                <TableCell>
                  <Chip
                    label={participant.status}
                    color={
                      participant.status === "Aprovado"
                        ? "success"
                        : participant.status === "Recusado"
                        ? "error"
                        : "default"
                    }
                  />
                </TableCell>
                <TableCell>
                  {participant.files.map((file) => (
                    <Box key={file.id} mb={1}>
                      <a
                        href={file.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.filename}
                      </a>
                    </Box>
                  ))}
                </TableCell>
                <TableCell>{participant.observations}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ViewUploads;