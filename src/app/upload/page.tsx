"use client";

import React, { useState } from "react";
import {
  Container,
  Button,
  CircularProgress,
  Backdrop,
  Typography,
  Box,
} from "@mui/material";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // Use a chave da API obtida no Google Cloud Console
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN; // A chave de acesso OAuth 2.0 gerada para o aplicativo

const FormPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const uploadFile = async (file: File) => {
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [process.env.NEXT_PUBLIC_SHARED_DRIVE_ID], // Define o destino da pasta no Google Drive
    };
    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: new Headers({ Authorization: `Bearer ${ACCESS_TOKEN}` }), // Usando o token de acesso
        body: form,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      for (const file of files) {
        await uploadFile(file);
      }
      alert("Upload realizado com sucesso!");
      setFiles([]);
    } catch (error) {
      console.error("Erro durante o upload:", error);
      alert("Erro inesperado durante o upload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Formulário de Upload para o Google Drive
      </Typography>
      <form onSubmit={handleSubmit}>
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
          </label>
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Upload"}
        </Button>
      </form>

      <Backdrop open={isSubmitting}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default FormPage;
