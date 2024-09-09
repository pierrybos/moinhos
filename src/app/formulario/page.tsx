"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Backdrop,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InputMask from "react-input-mask";

const FormPage = () => {
  const [participantName, setParticipantName] = useState("");
  const [churchGroupState, setChurchGroupState] = useState("");
  const [participationDate, setParticipationDate] = useState("");
  const [programPart, setProgramPart] = useState("");
  const [programParts, setProgramParts] = useState([]);
  const [phone, setPhone] = useState("");
  const [isWhatsApp, setIsWhatsApp] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [observations, setObservations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Verifica se o código está no client-side para evitar erros na build
    if (typeof window !== "undefined") {
      const fetchToken = async () => {
        try {
          const response = await fetch("/api/getAccessToken");
          const data = await response.json();

          if (data.accessToken) {
            setAccessToken(data.accessToken);
          } else {
            throw new Error("Failed to retrieve access token");
          }
        } catch (error) {
          alert("Erro ao obter o token de acesso. Por favor, tente novamente.");
        }
      };

      const fetchProgramParts = async () => {
        try {
          const response = await fetch("/api/program-parts");
          const data = await response.json();
          setProgramParts(data);
        } catch (error) {
          console.error("Erro ao carregar as partes do programa:", error);
        }
      };

      fetchToken();
      fetchProgramParts();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files!)]);
    }
  };

  const createFolder = async (name: string, parentId: string | undefined) => {
    if (!accessToken) {
      throw new Error("Access token not available");
    }
    const folderMetadata = {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : [],
    };
    const response = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(folderMetadata),
    });
    const data = await response.json();
    return data.id;
  };

  const uploadFile = async (file: File, folderId: string) => {
    if (!accessToken) {
      throw new Error("Access token not available");
    }
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [folderId],
    };
    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
      {
        method: "POST",
        headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
        body: form,
      }
    );
    const data = await response.json();
    return data.webViewLink; // Retorna o link do arquivo no Google Drive
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      alert("Por favor, selecione até 6 arquivos.");
      return;
    }

    if (!participationDate) {
      alert("Por favor, selecione uma data.");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedPhone = phone.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
      // Aqui, asseguramos que as chamadas à API ocorrem somente se o token de acesso está disponível
      if (!accessToken) {
        throw new Error("Token de acesso não está disponível.");
      }

      const date = new Date(participationDate);
      const yearFolderId = await createFolder(
        date.getFullYear().toString(),
        process.env.NEXT_PUBLIC_SHARED_DRIVE_ID
      );
      const monthFolderId = await createFolder(
        (date.getMonth() + 1).toString().padStart(2, "0"),
        yearFolderId
      );
      const dayFolderId = await createFolder(
        date.getDate().toString().padStart(2, "0"),
        monthFolderId
      );
      const programFolderId = await createFolder(programPart, dayFolderId);

      // Fazer o upload dos arquivos para o Google Drive e coletar metadados
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const link = await uploadFile(file, programFolderId);
          return {
            name: file.name,
            link, // Link obtido do Google Drive
          };
        })
      );

      // Montar o payload com as informações do participante e dos arquivos
      const payload = {
        participantName,
        churchGroupState,
        participationDate,
        programPart,
        phone: cleanedPhone,
        isWhatsApp,
        observations,
        files: uploadedFiles, // Metadados dos arquivos já no Google Drive
      };

      await fetch("/api/saveParticipant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      alert("Dados salvos com sucesso!");
      setFiles([]);
      setParticipantName("");
      setChurchGroupState("");
      setParticipationDate("");
      setProgramPart("");
      setPhone("");
      setIsWhatsApp(false);
      setObservations("");
    } catch (error) {
      console.error("Erro durante o upload:", error);
      alert("Erro inesperado durante o upload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        backgroundColor: "background.paper", // Fundo que se adapta ao tema
        color: "text.primary", // Cor do texto adaptada ao tema
        padding: 2,
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "text.primary" }} // Ajuste da cor do texto com base no tema
      >
        Formulário de Participação
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nome do Participante"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          fullWidth
          required
          margin="normal"
          sx={{
            "& .MuiInputBase-input": {
              color: "text.primary",
            },
            "& .MuiInputLabel-root": {
              color: "text.secondary",
            },
          }}
        />

        <TextField
          label="Qual Igreja/Grupo/Estado"
          value={churchGroupState}
          onChange={(e) => setChurchGroupState(e.target.value)}
          fullWidth
          required
          margin="normal"
          sx={{
            "& .MuiInputBase-input": {
              color: "text.primary",
            },
            "& .MuiInputLabel-root": {
              color: "text.secondary",
            },
          }}
        />

        <TextField
          label="Data de Participação"
          type="date"
          value={participationDate}
          onChange={(e) => setParticipationDate(e.target.value)}
          fullWidth
          required
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            "& .MuiInputBase-input": {
              color: "text.primary",
            },
            "& .MuiInputLabel-root": {
              color: "text.secondary",
            },
          }}
        />

        <InputMask
          mask="(99) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        >
          <TextField
            label="Telefone"
            fullWidth
            margin="normal"
            required
            placeholder="(XX) XXXXX-XXXX"
            sx={{
              "& .MuiInputBase-input": {
                color: "text.primary",
              },
              "& .MuiInputLabel-root": {
                color: "text.secondary",
              },
            }}
          />
        </InputMask>

        <FormControlLabel
          control={
            <Checkbox
              checked={isWhatsApp}
              onChange={(e) => setIsWhatsApp(e.target.checked)}
              color="primary"
            />
          }
          label="Este número é WhatsApp?"
          sx={{
            color: "text.primary",
          }}
        />

        <FormControl
          fullWidth
          required
          margin="normal"
          sx={{
            "& .MuiInputBase-input": {
              color: "text.primary",
            },
            "& .MuiInputLabel-root": {
              color: "text.secondary",
            },
          }}
        >
          <InputLabel>Parte do Programa</InputLabel>
          <Select
            value={programPart}
            onChange={(e) => setProgramPart(e.target.value)}
            label="Parte do Programa"
          >
            <MenuItem value="">
              <em>Selecione</em>
            </MenuItem>
            {programParts.map((part: { id: number; name: string }) => (
              <MenuItem key={part.id} value={part.name}>
                {part.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box margin="normal">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.mp4,.avi,.mp3,.pdf"
            style={{ display: "none" }}
            id="upload-files"
          />
          <label htmlFor="upload-files">
            <Button variant="contained" component="span">
              Selecionar Arquivos
            </Button>
            <FormHelperText sx={{ color: "text.secondary" }}>
              Até 6 arquivos (vídeos, fotos, etc.)
            </FormHelperText>
          </label>
        </Box>

        {files.length > 0 && (
          <Box margin="normal">
            <Typography variant="subtitle1" sx={{ color: "text.primary" }}>
              Arquivos Selecionados:
            </Typography>
            <List>
              {files.map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <UploadFileIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    sx={{ color: "text.primary" }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <TextField
          label="Observações"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          sx={{
            "& .MuiInputBase-input": {
              color: "text.primary",
            },
            "& .MuiInputLabel-root": {
              color: "text.secondary",
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Salvar"}
        </Button>
      </form>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default FormPage;
