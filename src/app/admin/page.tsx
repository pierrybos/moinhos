// src/app/admin/page.tsx
"use client";

import { useSession } from "next-auth/react";
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
  IconButton,
  Tooltip,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ProtectedRoute from "../components/ProtectedRoute";
import { useSnackbar } from "../components/useSnackbar"; // Ajuste o caminho conforme necessário
import CustomSnackbar from "../components/CustomSnackbar";

// Tipo para os dados dos participantes
type Participant = {
  id: number;
  name: string;
  group: string;
  participationDate: string;
  programPart: string;
  status: string;
  observations: string;
  phone?: string;
  isWhatsApp?: boolean;
  isMember?: boolean; // Adicione este campo para verificar se é membro
  allowedImage?: boolean; // Campo para direito de imagem
  files: {
    id: number;
    filename: string;
    driveLink: string;
  }[];
};

const formatPhoneNumber = (phone: string) => {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, "");
  // Formata o número no formato desejado
  return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const AdminPanel = () => {
  const { data: session } = useSession();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [statusUpdate, setStatusUpdate] = useState<{ [key: number]: string }>(
    {}
  );
  const { openSnackbar, snackbarProps } = useSnackbar();

  const [observationsUpdate, setObservationsUpdate] = useState<{
    [key: number]: string;
  }>({});

  // Carrega os dados dos participantes quando o usuário é autenticado e tem permissões de admin
  useEffect(() => {
    if (session?.user && session.user.isAdmin) {
      // Verifica se session e session.user não são undefined
      const fetchParticipants = async () => {
        const res = await fetch("/api/getParticipants", {
          cache: "no-store",
        });
        const data = await res.json();
        setParticipants(data.participants);
      };

      fetchParticipants();
    }
  }, [session]);

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
      openSnackbar("Atualizações salvas com sucesso!", "success");
    } else {
      openSnackbar("Erro ao salvar as atualizações.", "warning");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Tem certeza que deseja deletar este participante?"
    );
    if (!confirmDelete) return;

    const res = await fetch(`/api/participants/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setParticipants((prev) =>
        prev.filter((participant) => participant.id !== id)
      );
      openSnackbar("Participante deletado com sucesso!", "success");
    } else {
      openSnackbar("Erro ao deletar o participante.", "warning");
    }
  };

  return (
    <ProtectedRoute>
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
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Observações</TableCell>
                <TableCell>Arquivos</TableCell>
                <TableCell>Ações</TableCell>
                <TableCell>Imagem/Membro</TableCell> {/* Nova coluna */}
              </TableRow>
            </TableHead>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.group}</TableCell>
                  <TableCell>
                    {new Date(
                      participant.participationDate
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{participant.programPart}</TableCell>
                  <TableCell>
                    {participant.phone
                      ? formatPhoneNumber(participant.phone)
                      : ""}{" "}
                    {participant.isWhatsApp && participant.phone && (
                      <IconButton
                        href={`https://wa.me/55${participant.phone.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                      >
                        <WhatsAppIcon color="success" />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>
                    <FormControl>
                      <Select
                        value={
                          statusUpdate[participant.id] || participant.status
                        }
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
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDelete(participant.id)}
                      sx={{ mt: 1 }}
                    >
                      Deletar
                    </Button>
                  </TableCell>
                  <TableCell>
                    {/* Ícones e mensagens de status */}
                    {participant.isMember ? (
                      <Tooltip title="É membro da IASD">
                        <CheckCircleIcon color="success" />
                      </Tooltip>
                    ) : participant.allowedImage ? (
                      <Tooltip title="Direito de uso de imagem concedido">
                        <CheckCircleIcon color="success" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Não é membro nem permitiu imagem">
                        <WarningIcon color="error" />
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      <CustomSnackbar {...snackbarProps} />
    </ProtectedRoute>
  );
};

export default AdminPanel;
