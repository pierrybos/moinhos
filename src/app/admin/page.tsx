// src/app/admin/page.tsx
"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
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
  TextField,
  Tooltip,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ProtectedRoute from "../components/ProtectedRoute";
import { useSnackbar } from "../components/useSnackbar";
import CustomSnackbar from "../components/CustomSnackbar";

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
  isMember?: boolean;
  allowedImage?: boolean;
  performanceType: string; // Novo campo
  microphoneCount?: number; // Novo campo
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
  const [expanded, setExpanded] = useState<number | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{ [key: number]: string }>(
    {}
  );
  const [observationsUpdate, setObservationsUpdate] = useState<{
    [key: number]: string;
  }>({});
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const { openSnackbar, snackbarProps } = useSnackbar();

  useEffect(() => {
    if (session?.user && session.user.isAdmin) {
      const fetchParticipants = async () => {
        const res = await fetch("/api/getParticipants", {
          cache: "no-store",
        });
        const data = await res.json();
        setParticipants(data.participants);
      };

      fetchParticipants();
    }
  }, [session, openSnackbar]);

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
      setEditMode((prev) => ({ ...prev, [id]: false })); // Fecha o modo de edição
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

  const handleExpandToggle = (id: number) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const handleEditToggle = (id: number) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Aprovado":
        return {
          color: "#388e3c",
          border: "1px solid #388e3c",
          backgroundColor: "#e8f5e9",
        };
      case "Recusado":
        return {
          color: "#d32f2f",
          border: "1px solid #d32f2f",
          backgroundColor: "#ffebee",
        };
      case "Pendente":
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
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Painel de Administração
        </Typography>
        <Grid container spacing={2}>
          {participants.map((participant) => (
            <Grid item xs={12} sm={6} md={4} key={participant.id}>
              <List>
                <ListItem
                  onClick={() => handleExpandToggle(participant.id)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between", // Garante que os elementos fiquem separados
                    alignItems: "center", // Alinha os itens ao centro
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1" component="span">
                          {participant.name}
                        </Typography>
                        <Chip
                          label={participant.status}
                          size="small"
                          sx={{
                            ml: 1,
                            ...getStatusStyle(participant.status),
                          }}
                        />
                      </Box>
                    }
                    secondary={`${new Date(
                      participant.participationDate
                    ).toLocaleDateString()} - ${participant.programPart}`}
                  />
                  <IconButton
                    onClick={() => handleExpandToggle(participant.id)}
                  >
                    {expanded === participant.id ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                </ListItem>
                <Collapse
                  in={expanded === participant.id}
                  timeout="auto"
                  unmountOnExit
                >
                  <Box p={2} border={1} borderRadius={4} mb={2}>
                    <Typography variant="subtitle1" gutterBottom>
                      Informações Gerais
                    </Typography>
                    <Divider />
                    <Box mt={2}>
                      <Typography>Grupo/Igreja: {participant.group}</Typography>
                      <Typography>
                        Telefone:{" "}
                        {participant.phone
                          ? formatPhoneNumber(participant.phone)
                          : "N/A"}{" "}
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
                      </Typography>
                      <Typography>
                        Tipo de Apresentação: {participant.performanceType}
                      </Typography>
                      {participant.performanceType === "Conjunto/Quarteto" && (
                        <Typography>
                          Quantidade de Microfones:{" "}
                          {participant.microphoneCount}
                        </Typography>
                      )}
                    </Box>
                    <Box mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Status
                      </Typography>
                      <Divider />
                      {editMode[participant.id] ? (
                        <FormControl fullWidth>
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
                      ) : (
                        <Typography
                          sx={{
                            ...getStatusStyle(participant.status),
                            padding: "4px",
                            borderRadius: "4px",
                            display: "inline-block",
                            mt: 1,
                          }}
                        >
                          {participant.status}
                        </Typography>
                      )}
                    </Box>
                    <Box mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Observações
                      </Typography>
                      <Divider />
                      {editMode[participant.id] ? (
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
                      ) : (
                        <Typography>{participant.observations}</Typography>
                      )}
                    </Box>
                    <Box mt={2}>
                      {editMode[participant.id] ? (
                        <>
                          <IconButton
                            onClick={() => handleUpdate(participant.id)}
                            color="primary"
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleEditToggle(participant.id)}
                            color="secondary"
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton
                          onClick={() => handleEditToggle(participant.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDelete(participant.id)}
                        sx={{ ml: 1 }}
                      >
                        Deletar
                      </Button>
                    </Box>
                    <Box mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Arquivos
                      </Typography>
                      <Divider />
                      <Box mt={1}>
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
                      </Box>
                    </Box>
                    <Typography mt={2}>
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
                    </Typography>
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

export default AdminPanel;
