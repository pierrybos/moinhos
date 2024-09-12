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
import { useSession } from "next-auth/react";

// Tipo para os dados dos participantes
type Participant = {
  id: number;
  name: string;
  group: string;
  participationDate: string;
  programPart: string;
  observations: string;
  status: string;
  files: {
    id: number;
    filename: string;
    driveLink: string;
  }[];
};

export const dynamic = "force-dynamic"; // Garante que a página seja sempre renderizada dinamicamente

const ViewUploads = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Carregando...</p>;
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Carregando...</p>;

  useEffect(() => {
    const timestamp = new Date().getTime(); // Generate a unique timestamp

    // Função para buscar os dados dos participantes e arquivos
    const fetchParticipants = async () => {
      const res = await fetch(`/api/getParticipants?timestamp=${timestamp}`, {
        cache: "no-store",
      });
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
                      {!session && (
                        <a
                          href={file.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.filename}
                        </a>
                      )}
                      {session && <span>{file.filename}</span>}
                      {!session && (
                        <a
                          href={file.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.filename}
                        </a>
                      )}
                      {session && <span>{file.filename}</span>}
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
