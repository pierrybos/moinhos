"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FormPage = () => {
  const [participantName, setParticipantName] = useState("");
  const [churchGroupState, setChurchGroupState] = useState("");
  const [participationDate, setParticipationDate] = useState("");
  const [programPart, setProgramPart] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [observations, setObservations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Acumula os arquivos selecionados
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files)]);
    }
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

    setIsSubmitting(true); // Inicia o estado de envio

    const formData = new FormData();
    formData.append("participantName", participantName);
    formData.append("churchGroupState", churchGroupState);
    formData.append("participationDate", participationDate);
    formData.append("programPart", programPart);
    formData.append("observations", observations);

    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch("/api/saveParticipant", {
      method: "POST",
      body: formData,
    });

    setIsSubmitting(false); // Encerra o estado de envio

    if (res.ok) {
      alert("Dados salvos com sucesso!");
      setFiles([]); // Limpa os arquivos após o upload
      setParticipantName("");
      setChurchGroupState("");
      setParticipationDate("");
      setProgramPart("");
      setObservations("");
    } else {
      alert("Erro ao salvar os dados.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
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
        />

        <TextField
          label="Qual Igreja/Grupo/Estado"
          value={churchGroupState}
          onChange={(e) => setChurchGroupState(e.target.value)}
          fullWidth
          required
          margin="normal"
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
        />

        <FormControl fullWidth required margin="normal">
          <InputLabel>Parte do Programa</InputLabel>
          <Select
            value={programPart}
            onChange={(e) => setProgramPart(e.target.value)}
            label="Parte do Programa"
          >
            <MenuItem value="">
              <em>Selecione</em>
            </MenuItem>
            <MenuItem value="Mensagem Musical">Mensagem Musical</MenuItem>
            <MenuItem value="Sermão">Sermão</MenuItem>
            <MenuItem value="Especial">Especial</MenuItem>
            <MenuItem value="Outro">Outro</MenuItem>
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
            <FormHelperText>
              Até 6 arquivos (vídeos, fotos, etc.)
            </FormHelperText>
          </label>
        </Box>

        {/* Lista de Arquivos Selecionados */}
        {files.length > 0 && (
          <Box margin="normal">
            <Typography variant="subtitle1">Arquivos Selecionados:</Typography>
            <List>
              {files.map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <UploadFileIcon />
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
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
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting} // Desabilita o botão durante o envio
        >
          {isSubmitting ? "Enviando..." : "Salvar"}
        </Button>
      </form>

      {/* Overlay de Carregamento */}
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

/* app/page.tsx
"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FormPage = () => {
  const [participantName, setParticipantName] = useState("");
  const [churchGroupState, setChurchGroupState] = useState("");
  const [participationDate, setParticipationDate] = useState("");
  const [programPart, setProgramPart] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [observations, setObservations] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      alert("Por favor, selecione até 6 arquivos.");
      return;
    }

    if (!participationDate) {
      alert("Por favor, selecione uma data.");
      return;
    }

    const formData = new FormData();
    formData.append("participantName", participantName);
    formData.append("churchGroupState", churchGroupState);
    formData.append("participationDate", participationDate);
    formData.append("programPart", programPart);
    formData.append("observations", observations);

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch("/api/saveParticipant", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Dados salvos com sucesso!");
      setFiles(null); // Limpa os arquivos após o upload
      setParticipantName("");
      setChurchGroupState("");
      setParticipationDate("");
      setProgramPart("");
      setObservations("");
    } else {
      alert("Erro ao salvar os dados.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
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
        />

        <TextField
          label="Qual Igreja/Grupo/Estado"
          value={churchGroupState}
          onChange={(e) => setChurchGroupState(e.target.value)}
          fullWidth
          required
          margin="normal"
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
        />

        <FormControl fullWidth required margin="normal">
          <InputLabel>Parte do Programa</InputLabel>
          <Select
            value={programPart}
            onChange={(e) => setProgramPart(e.target.value)}
            label="Parte do Programa"
          >
            <MenuItem value="">
              <em>Selecione</em>
            </MenuItem>
            <MenuItem value="Mensagem Musical">Mensagem Musical</MenuItem>
            <MenuItem value="Sermão">Sermão</MenuItem>
            <MenuItem value="Especial">Especial</MenuItem>
            <MenuItem value="Outro">Outro</MenuItem>
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
            <FormHelperText>
              Até 6 arquivos (vídeos, fotos, etc.)
            </FormHelperText>
          </label>
        </Box>

        {/* Lista de Arquivos Selecionados * /}
        {files && files.length > 0 && (
          <Box margin="normal">
            <Typography variant="subtitle1">Arquivos Selecionados:</Typography>
            <List>
              {Array.from(files).map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <UploadFileIcon />
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
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
        />

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Salvar
        </Button>
      </form>
    </Container>
  );
};

export default FormPage;

/* app/page.tsx
"use client";

import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const Page = () => {
  const [participationDate, setParticipationDate] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      alert("Por favor, selecione até 6 arquivos.");
      return;
    }

    if (!participationDate) {
      alert("Por favor, selecione uma data.");
      return;
    }

    const formData = new FormData();
    formData.append("participationDate", participationDate);

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch("/api/uploadFile", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Arquivos enviados com sucesso!");
      setFiles(null); // Limpa os arquivos após o upload
    } else {
      alert("Erro ao enviar os arquivos.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Upload de Arquivos com Base na Data
      </Typography>
      <form onSubmit={handleSubmit}>
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
        />

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
            <FormHelperText>
              Até 6 arquivos (vídeos, fotos, etc.)
            </FormHelperText>
          </label>
        </Box>

        {/* Lista de Arquivos Selecionados * /}
        {files && files.length > 0 && (
          <Box margin="normal">
            <Typography variant="subtitle1">Arquivos Selecionados:</Typography>
            <List>
              {Array.from(files).map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <UploadFileIcon />
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Enviar Arquivos
        </Button>
      </form>
    </Container>
  );
};

export default Page;
*/
