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
  IconButton,
} from "@mui/material";
import Image from "next/image";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MaskedInput from "react-text-mask";
import CustomSnackbar from "../components/CustomSnackbar"; // ajuste o caminho conforme necessário
import { useSnackbar } from "../components/useSnackbar"; // ajuste o caminho conforme necessário
import { SelectChangeEvent } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllExtensions } from "../../utils/fileExtensions"; // ajuste o caminho conforme necessário

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
  const [imageRightsGranted, setImageRightsGranted] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null);
  const [bibleVersion, setBibleVersion] = useState<string>("");

  const { openSnackbar, snackbarProps } = useSnackbar();
  const [performanceType, setPerformanceType] = useState("");
  const [microphoneCount, setMicrophoneCount] = useState<number>(1);
  const extensionList = getAllExtensions().join(",");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parts = await fetchProgramParts();
        setProgramParts(parts);
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
        openSnackbar(
          "Erro ao carregar dados. Por favor, tente novamente.",
          "warning"
        );
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verifica se o token expirou
  const isTokenExpired = () => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    return !tokenExpiry || new Date().getTime() > parseInt(tokenExpiry);
  };

  // Obtém um novo token de acesso
  const fetchNewToken = async () => {
    try {
      const response = await fetch("/api/getAccessToken");
      const data = await response.json();

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem(
          "tokenExpiry",
          (new Date().getTime() + 3600 * 1000).toString() // 1 hora de validade
        );
        return data.accessToken;
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

  // Obtém um token válido antes de fazer a requisição
  const getValidAccessToken = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken || isTokenExpired()) {
      // Se o token expirou ou não existe, obtenha um novo
      return await fetchNewToken();
    }

    return accessToken;
  };

  const fetchProgramParts = async () => {
    const response = await fetch("/api/program-parts");
    const data = await response.json();
    return data;
  };

  const handlePerformanceTypeChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as string;
    setPerformanceType(value);

    if (value === "Solo") {
      setMicrophoneCount(1);
    }
  };

  const handleImageRightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageRightsGranted(e.target.checked);
  };

  const handleIsMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsMember(isChecked);

    if (isChecked) {
      setImageRightsGranted(true);
    } else {
      setImageRightsGranted(false);
    }
  };

  const handleUserPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUserPhoto(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveUserPhoto = () => {
    setUserPhoto(null);
    setUserPhotoPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files!)]);
    }
  };

  // Função para manipular mudanças na parte do programa
  const handleProgramPartChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setProgramPart(value);

    // Se a parte do programa for "Sermão", definimos automaticamente o tipo de apresentação e o número de microfones
    if (value === "Sermão") {
      setPerformanceType("Solo");
      setMicrophoneCount(1);
    } else {
      // Reseta o campo se não for "Sermão"
      setPerformanceType("");
      setMicrophoneCount(1);
    }
  };

  const findFolder = async (name: string, parentId: string | undefined) => {
    const accessToken = await getValidAccessToken(); // Obtém um token válido

    const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        query
      )}&fields=files(id,name)`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`, // Usa o token válido
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro na requisição à API do Google Drive");
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  };

  // Função para criar uma pasta ou retornar o ID de uma existente
  const getOrCreateFolder = async (
    name: string,
    parentId: string | undefined
  ) => {
    let folderId = await findFolder(name, parentId);

    if (!folderId) {
      // Se a pasta não existe, cria uma nova
      folderId = await createFolder(name, parentId);
    }

    return folderId;
  };
  const createFolder = async (name: string, parentId: string | undefined) => {
    const accessToken = await getValidAccessToken(); // Obtém um token válido

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
    const accessToken = await getValidAccessToken(); // Obtém um token válido

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

    if (!response.ok) {
      throw new Error(`Upload failed for ${file.name}`);
    }

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

      const date = new Date(participationDate);
      const yearFolderId = await getOrCreateFolder(
        date.getFullYear().toString(),
        process.env.NEXT_PUBLIC_SHARED_DRIVE_ID
      );
      const monthFolderId = await getOrCreateFolder(
        (date.getMonth() + 1).toString().padStart(2, "0"),
        yearFolderId
      );
      const dayFolderId = await getOrCreateFolder(
        date.getDate().toString().padStart(2, "0"),
        monthFolderId
      );
      const programFolderId = await createFolder(programPart, dayFolderId);

      const fileFolderId = await createFolder("arquivos", programFolderId);
      const userPhotoFolderId = await createFolder("foto", programFolderId);

      let userPhotoLink = "";
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          try {
            const link = await uploadFile(file, fileFolderId);
            return {
              name: file.name,
              link,
            };
          } catch (error) {
            throw new Error(`Erro no upload do arquivo: ${file.name}`);
          }
        })
      );

      if (userPhoto) {
        userPhotoLink = await uploadFile(userPhoto, userPhotoFolderId);
      }

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
        userPhoto: userPhotoLink,
        bibleVersion,
      };

      await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      openSnackbar("Dados salvos com sucesso!", "success");
      setFiles([]);
      setParticipantName("");
      setChurchGroupState("");
      setParticipationDate("");
      setProgramPart("");
      setPhone("");
      setIsWhatsApp(false);
      setObservations("");
      setPerformanceType("");
      setMicrophoneCount(1);
      setUserPhoto(null); // Resetar a foto do usuário
      setUserPhotoPreview(null); // Resetar a pré-visualização
      setBibleVersion(""); // Resetar a versão da Bíblia
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
            onChange={handleProgramPartChange}
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
          <InputLabel>Tipo de Participação</InputLabel>
          <Select
            value={performanceType}
            onChange={handlePerformanceTypeChange}
            label="Tipo de Participação"
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

        {/* Campo de seleção de versão da Bíblia, exibido apenas quando programPart for "Sermão" */}
        {programPart === "Sermão" && (
          <FormControl
            fullWidth
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
            <InputLabel>Versão da Bíblia</InputLabel>
            <Select
              value={bibleVersion}
              onChange={(e) => setBibleVersion(e.target.value)}
              label="Versão da Bíblia"
            >
              <MenuItem value="ACF">ACF - Almeida Corrigida Fiel</MenuItem>
              <MenuItem value="ARA">ARA - Almeida Revista Atualizada</MenuItem>
              <MenuItem value="ARC">ARC - Almeida Revista Corrigida</MenuItem>
              <MenuItem value="A21">A21 - Almeida Século 21</MenuItem>
              <MenuItem value="KJA">KJA - King James Atualizada</MenuItem>
              <MenuItem value="NAA">NAA - Nova Almeida Atualizada</MenuItem>
              <MenuItem value="NBV">NBV - Nova Bíblia Viva</MenuItem>
              <MenuItem value="NVI">NVI - Nova Versão Internacional</MenuItem>
              <MenuItem value="NVT">NVT - Nova Versão Transformadora</MenuItem>
              <MenuItem value="NTLH">
                NTLH - Nova Tradução na Linguagem de Hoje
              </MenuItem>
            </Select>
          </FormControl>
        )}

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

        {/* Campo para Upload da Foto do Participante */}
        <FormControl
          fullWidth
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
          <Typography gutterBottom>Upload da Foto do Participante</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handleUserPhotoChange}
            style={{ display: "none" }}
            id="upload-user-photo"
          />
          <label htmlFor="upload-user-photo">
            <Button variant="contained" component="span">
              Selecionar Foto
            </Button>
            <FormHelperText sx={{ color: "text.secondary" }}>
              Envie uma foto do participante.
            </FormHelperText>
          </label>
          {userPhotoPreview && (
            <Box mt={2} display="flex" alignItems="center">
              <Image
                src={userPhotoPreview} // URL da imagem
                alt="Pré-visualização da Foto"
                width={100} // Largura da imagem
                height={100} // Altura da imagem
                style={{
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "1px solid #ccc",
                  marginRight: 16,
                }}
              />
              <IconButton onClick={handleRemoveUserPhoto} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
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
