// app/admin/page.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
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
  Select,
  MenuItem,
  FormControl,
  Box,
  TextField,
} from "@mui/material";

// Tipo para os dados dos participantes
type Participant = {
  id: number;
  name: string;
  group: string;
  participationDate: string;
  programPart: string;
  status: string;
  observations: string;
  files: {
    id: number;
    filename: string;
    driveLink: string;
  }[];
};

const AdminPanel = () => {
  const { data: session, status } = useSession();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [statusUpdate, setStatusUpdate] = useState<{ [key: number]: string }>(
    {}
  );
  const [observationsUpdate, setObservationsUpdate] = useState<{
    [key: number]: string;
  }>({});

  // Carrega os dados dos participantes quando o usuário é autenticado e tem permissões de admin
  useEffect(() => {
    if (session && session.user.isAdmin) {
      const fetchParticipants = async () => {
        const res = await fetch("/api/getParticipants");
        const data = await res.json();
        setParticipants(data.participants);
      };

      fetchParticipants();
    }
  }, [session]);

  // Proteção: se a sessão estiver carregando, exibe um estado de carregamento
  if (status === "loading") return <p>Carregando...</p>;

  // Proteção: se o usuário não estiver logado ou não for administrador, exibe acesso negado
  if (!session) {
    return (
      <Container>
        <Typography variant="h6">Você não está autenticado.</Typography>
        <Button onClick={() => signIn()}>Faça login</Button>
      </Container>
    );
  }

  if (!session.user.isAdmin) {
    return (
      <Container>
        <Typography variant="h6">
          Acesso Negado. Você não tem permissão para acessar esta página.
        </Typography>
        <Button onClick={() => signOut()}>Sair</Button>
      </Container>
    );
  }

  // Função para atualizar o status e as observações do participante
  const handleUpdate = async (id: number) => {
    const newStatus = statusUpdate[id];
    const newObservation = observationsUpdate[id];

    const res = await fetch(`/api/updateStatus`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status: newStatus,
        observations: newObservation,
      }),
    });

    if (res.ok) {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.id === id
            ? {
                ...participant,
                status: newStatus || participant.status,
                observations: newObservation || participant.observations,
              }
            : participant
        )
      );
      alert("Atualizações salvas com sucesso!");
    } else {
      alert("Erro ao salvar as atualizações.");
    }
  };

  // Conteúdo da página de administração
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Painel de Administração
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
              <TableCell>Observações</TableCell>
              <TableCell>Arquivos</TableCell>
              <TableCell>Ações</TableCell>
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
                  <FormControl>
                    <Select
                      value={statusUpdate[participant.id] || participant.status}
                      onChange={(e) =>
                        setStatusUpdate({
                          ...statusUpdate,
                          [participant.id]: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="Pendente">Pendente</MenuItem>
                      <MenuItem value="Aprovado">Aprovado</MenuItem>
                      <MenuItem value="Recusado">Recusado</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    value={
                      observationsUpdate[participant.id] ||
                      participant.observations
                    }
                    onChange={(e) =>
                      setObservationsUpdate({
                        ...observationsUpdate,
                        [participant.id]: e.target.value,
                      })
                    }
                    multiline
                    rows={3}
                    variant="outlined"
                    fullWidth
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
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdate(participant.id)}
                  >
                    Salvar Alterações
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

export default AdminPanel;
