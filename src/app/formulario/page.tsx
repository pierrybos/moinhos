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
  Slider,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MaskedInput from "react-text-mask";
import CustomSnackbar from "../components/CustomSnackbar"; // ajuste o caminho conforme necessário
import { useSnackbar } from "../components/useSnackbar"; // ajuste o caminho conforme necessário
import { SelectChangeEvent } from "@mui/material";

// Importando o módulo com as extensões permitidas
import { getAllExtensions } from "../../utils/fileExtensions"; // ajuste o caminho conforme sua estrutura de pastas

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
  const [imageRightsGranted, setImageRightsGranted] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const { openSnackbar, snackbarProps } = useSnackbar();

  // Novos estados para o tipo de apresentação e microfones
  const [performanceType, setPerformanceType] = useState("");
  const [microphoneCount, setMicrophoneCount] = useState<number>(1); // Valor inicial do slider

  // Função para manipular mudanças no tipo de apresentação
  const handlePerformanceTypeChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as string;
    setPerformanceType(value);

    // Reseta o número de microfones se for "Solo"
    if (value === "Solo") {
      setMicrophoneCount(1);
    }
  };

  const extensionList = getAllExtensions().join(",");

  const handleImageRightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageRightsGranted(e.target.checked);
  };

  const handleIsMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsMember(isChecked);

    // Se for membro, direito de imagem é automaticamente concedido
    if (isChecked) {
      setImageRightsGranted(true);
    } else {
      setImageRightsGranted(false);
    }
  };

  useEffect(() => {
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
          openSnackbar(
            "Erro ao obter o token de acesso. Por favor, tente novamente.",
            "warning"
          );
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
  }, [openSnackbar]);

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

    if (!isMember && !imageRightsGranted) {
      openSnackbar(
        "Você deve conceder o direito de imagem ou ser membro da IASD para continuar.",
        "warning"
      );

      return;
    }

    if (files.length === 0) {
      openSnackbar(
        "Por favor, selecione pelo menos 1, até 6 arquivos.",
        "warning"
      );
      return;
    }

    if (!participationDate) {
      openSnackbar("Por favor, selecione uma data.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedPhone = phone.replace(/\D/g, "");
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
        files: uploadedFiles,
        imageRightsGranted,
        isMember,
        performanceType,
        microphoneCount,
      };

      await fetch("/api/saveParticipant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      openSnackbar("Dados salvos com sucesso!", "success");
      // Resetar o formulário
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
      openSnackbar("Erro inesperado durante o upload.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        backgroundColor: "background.paper",
        color: "text.primary",
        padding: 2,
        borderRadius: 2,
      }}
    >
      <CustomSnackbar {...snackbarProps} />

      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "text.primary" }}
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

        <FormControl fullWidth margin="normal">
          <InputLabel>Telefone</InputLabel>
          <MaskedInput
            mask={[
              "(",
              /[1-9]/,
              /\d/,
              ")",
              " ",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              "-",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
            ]}
            placeholder="(XX) XXXXX-XXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            render={(ref, props) => (
              <TextField
                {...props}
                inputRef={ref}
                required
                margin="normal"
                fullWidth
                error={!!phone && phone.length !== 15}
                helperText={
                  phone && phone.length !== 15
                    ? "Insira um telefone válido com DDD."
                    : ""
                }
                sx={{
                  "& .MuiInputBase-input": {
                    color: "text.primary",
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                  },
                }}
              />
            )}
          />
        </FormControl>

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
          <InputLabel>Tipo de Apresentação</InputLabel>
          <Select
            value={performanceType}
            onChange={handlePerformanceTypeChange}
            label="Tipo de Apresentação"
          >
            <MenuItem value="Solo">Solo</MenuItem>
            <MenuItem value="Conjunto/Quarteto">Conjunto/Quarteto</MenuItem>
            <MenuItem value="Coral">Coral</MenuItem>
          </Select>
        </FormControl>

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
          <Typography gutterBottom>
            Número de Microfones Necessários: {microphoneCount}
          </Typography>
          <Slider
            value={microphoneCount}
            onChange={(e, newValue) => setMicrophoneCount(newValue as number)}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={6}
            disabled={performanceType === "Solo"} // Desabilita o campo se for Solo
            aria-labelledby="microphone-slider"
          />
        </FormControl>
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
            accept={extensionList}
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

        <FormControlLabel
          control={
            <Checkbox
              checked={isMember}
              onChange={handleIsMemberChange}
              color="primary"
            />
          }
          label="É membro da IASD?"
          sx={{
            color: "text.primary",
          }}
        />

        {/* Checkbox de direito de imagem que é desabilitado quando for membro */}
        <FormControlLabel
          control={
            <Checkbox
              checked={imageRightsGranted}
              onChange={handleImageRightsChange}
              disabled={isMember}
              color="primary"
            />
          }
          label="Concedo o direito de uso de minha imagem para divulgação."
          sx={{
            color: "text.primary",
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
