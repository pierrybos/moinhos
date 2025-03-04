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
import CustomSnackbar from "../../components/CustomSnackbar";
import { useSnackbar } from "../../components/useSnackbar";
import { SelectChangeEvent } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllExtensions } from "../../../utils/fileExtensions";
import { useParams } from "next/navigation";

interface InstitutionSettings {
  maxMicrophones: number;
  membershipText: string;
  imageRightsText: string;
  bibleVersions: string[];
  driveConfig: any;
}

const FormPage = () => {
  const params = useParams();
  const institutionId = params.institutionId as string;

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
  const [performanceType, setPerformanceType] = useState("");
  const [microphoneCount, setMicrophoneCount] = useState<number>(1);
  const [institutionSettings, setInstitutionSettings] = useState<InstitutionSettings>({
    maxMicrophones: 1,
    membershipText: "Declaro que sou membro desta instituição",
    imageRightsText: "Autorizo o uso da minha imagem",
    bibleVersions: ["NVI", "ACF", "ARA"],
    driveConfig: {},
  });
  const extensionList = getAllExtensions().join(",");

  const { openSnackbar, snackbarProps } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parts, settings] = await Promise.all([
          fetchProgramParts(),
          fetchInstitutionSettings(),
        ]);
        console.log('Fetched Settings:', settings);
        setProgramParts(parts);
        setInstitutionSettings(settings);
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
        openSnackbar(
          "Erro ao carregar dados. Por favor, tente novamente.",
          "warning"
        );
      }
    };

    fetchData();
  }, []);

  const isTokenExpired = () => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    return !tokenExpiry || new Date().getTime() > parseInt(tokenExpiry);
  };

  const fetchNewToken = async () => {
    try {
      const response = await fetch("/api/getAccessToken");
      const data = await response.json();

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem(
          "tokenExpiry",
          (new Date().getTime() + 3600 * 1000).toString()
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

  const getValidAccessToken = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken || isTokenExpired()) {
      return await fetchNewToken();
    }

    return accessToken;
  };

  const fetchProgramParts = async () => {
    const response = await fetch(
      `/api/institutions/${institutionId}/program-parts`
    );
    const data = await response.json();
    return data;
  };

  const fetchInstitutionSettings = async () => {
    try {
      const response = await fetch(
        `/api/institutions/${institutionId}/settings`
      );
      if (!response.ok) throw new Error("Failed to fetch institution settings");
      const data = await response.json();
      console.log('Received settings:', data);
      return {
        maxMicrophones: typeof data.maxMicrophones === 'number' ? data.maxMicrophones : 5,
        membershipText: data.membershipText || "Declaro que sou membro desta instituição",
        imageRightsText: data.imageRightsText || "Autorizo o uso da minha imagem",
        bibleVersions: data.bibleVersions || ["NVI", "ACF", "ARA"],
        driveConfig: data.driveConfig || {},
      };
    } catch (error) {
      console.error("Error fetching institution settings:", error);
      return {
        maxMicrophones: 5,
        membershipText: "Declaro que sou membro desta instituição",
        imageRightsText: "Autorizo o uso da minha imagem",
        bibleVersions: ["NVI", "ACF", "ARA"],
        driveConfig: {},
      };
    }
  };

  const handlePerformanceTypeChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as string;
    console.log('Performance Type Changed:', value);
    setPerformanceType(value);

    if (value === "Solo") {
      setMicrophoneCount(1);
    } else {
      // Se não for solo, definir um valor inicial de microfones
      setMicrophoneCount(2);
    }
  };

  const handleImageRightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageRightsGranted(e.target.checked);
  };

  const handleIsMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsMember(isChecked);
    setImageRightsGranted(isChecked); // Se é membro, automaticamente concede direitos de imagem
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

  const handleProgramPartChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setProgramPart(value);

    if (value === "Sermão") {
      setPerformanceType("Solo");
      setMicrophoneCount(1);
    } else {
      setPerformanceType("");
      setMicrophoneCount(1);
    }
  };

  const findFolder = async (name: string, parentId: string | undefined) => {
    const accessToken = await getValidAccessToken();

    const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        query
      )}&fields=files(id,name)`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return data.files[0]?.id;
  };

  const createFolder = async (name: string, parentId: string | undefined) => {
    const accessToken = await getValidAccessToken();

    const response = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : undefined,
      }),
    });

    const data = await response.json();
    return data.id;
  };

  const getOrCreateFolder = async (name: string, parentId: string | undefined) => {
    let folderId = await findFolder(name, parentId);
    if (!folderId) {
      folderId = await createFolder(name, parentId);
    }
    return folderId;
  };

  const uploadFile = async (file: File, folderId: string) => {
    const accessToken = await getValidAccessToken();

    const form = new FormData();
    form.append("file", file);
    form.append("participantName", participantName);
    form.append("churchGroupState", churchGroupState);
    form.append("participationDate", participationDate);
    form.append("programPart", programPart);
    form.append("phone", phone);
    form.append("isWhatsApp", isWhatsApp.toString());
    form.append("observations", observations);
    form.append("imageRightsGranted", imageRightsGranted.toString());
    form.append("isMember", isMember.toString());
    form.append("performanceType", performanceType);
    form.append("microphoneCount", microphoneCount.toString());
    form.append("bibleVersion", bibleVersion);

    const response = await fetch(`/api/institutions/${institutionId}/upload`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!files.length) {
        openSnackbar("Por favor, selecione pelo menos um arquivo", "warning");
        return;
      }

      for (const file of files) {
        await uploadFile(file, institutionId);
      }

      // Reset form
      setParticipantName("");
      setChurchGroupState("");
      setParticipationDate("");
      setProgramPart("");
      setPhone("");
      setIsWhatsApp(false);
      setFiles([]);
      setObservations("");
      setImageRightsGranted(false);
      setIsMember(false);
      setUserPhoto(null);
      setUserPhotoPreview(null);
      setBibleVersion("");
      setPerformanceType("");
      setMicrophoneCount(1);

      openSnackbar("Arquivos enviados com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao enviar arquivos:", error);
      openSnackbar(
        "Erro ao enviar arquivos. Por favor, tente novamente.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Formulário de Envio
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="Nome do Participante"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Grupo/Igreja"
          value={churchGroupState}
          onChange={(e) => setChurchGroupState(e.target.value)}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          type="date"
          label="Data da Participação"
          value={participationDate}
          onChange={(e) => setParticipationDate(e.target.value)}
          required
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Parte do Programa</InputLabel>
          <Select
            value={programPart}
            onChange={handleProgramPartChange}
            required
          >
            {programParts.map((part: string) => (
              <MenuItem key={part} value={part}>
                {part}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo de Apresentação</InputLabel>
          <Select
            value={performanceType}
            onChange={handlePerformanceTypeChange}
            required
            disabled={programPart === "Sermão"}
          >
            <MenuItem value="Solo">Solo</MenuItem>
            <MenuItem value="Dueto">Dueto</MenuItem>
            <MenuItem value="Grupo">Grupo</MenuItem>
            <MenuItem value="Coral">Coral</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <Typography gutterBottom>Quantidade de Microfones</Typography>
          <Slider
            value={microphoneCount}
            onChange={(_, value) => {
              if (performanceType !== "Solo") {
                setMicrophoneCount(value as number);
              }
            }}
            step={1}
            marks
            min={1}
            max={institutionSettings.maxMicrophones}
            disabled={performanceType === "Solo"}
            valueLabelDisplay="auto"
          />
          <FormHelperText>
            {performanceType === "Solo"
              ? "Apresentação solo utiliza apenas 1 microfone"
              : `Selecione a quantidade de microfones necessária (1-${institutionSettings.maxMicrophones})`}
          </FormHelperText>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Versão da Bíblia</InputLabel>
          <Select
            value={bibleVersion}
            onChange={(e) => setBibleVersion(e.target.value)}
            required={programPart === "Sermão"}
            disabled={programPart !== "Sermão"}
          >
            {institutionSettings.bibleVersions.map((version) => (
              <MenuItem key={version} value={version}>
                {version}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <MaskedInput
            mask={[
              "(",
              /\d/,
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
            guide={false}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            render={(ref, props) => (
              <TextField
                {...props}
                inputRef={ref}
                label="Telefone"
                required
                fullWidth
              />
            )}
          />
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={isWhatsApp}
              onChange={(e) => setIsWhatsApp(e.target.checked)}
            />
          }
          label="Este número é WhatsApp"
          sx={{ mt: 1 }}
        />

        <Box sx={{ mt: 3 }}>
          <input
            type="file"
            id="user-photo"
            accept="image/*"
            onChange={handleUserPhotoChange}
            style={{ display: "none" }}
          />
          <label htmlFor="user-photo">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadFileIcon />}
            >
              {userPhoto ? "Trocar Foto" : "Adicionar Foto"}
            </Button>
          </label>

          {userPhotoPreview && (
            <Box sx={{ mt: 2, position: "relative", display: "inline-block" }}>
              <Image
                src={userPhotoPreview}
                alt="Preview"
                width={200}
                height={200}
                style={{ objectFit: "cover" }}
              />
              <IconButton
                onClick={handleRemoveUserPhoto}
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bgcolor: "background.paper",
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 3 }}>
          <input
            type="file"
            id="file-upload"
            multiple
            accept={extensionList}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadFileIcon />}
            >
              Adicionar Arquivos
            </Button>
          </label>

          <List>
            {files.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={file.name} />
              </ListItem>
            ))}
          </List>
        </Box>

        <TextField
          fullWidth
          label="Observações"
          multiline
          rows={4}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          margin="normal"
        />

        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isMember}
                onChange={handleIsMemberChange}
                color="primary"
              />
            }
            label={institutionSettings.membershipText}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={imageRightsGranted}
                onChange={(e) => {
                  if (!isMember) {
                    setImageRightsGranted(e.target.checked);
                  }
                }}
                disabled={isMember}
                color="primary"
              />
            }
            label={institutionSettings.imageRightsText}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{ mt: 3 }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Enviar"}
        </Button>
      </Box>

      <Backdrop open={isSubmitting} sx={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <CustomSnackbar {...snackbarProps} />
    </Container>
  );
};

export default FormPage;
