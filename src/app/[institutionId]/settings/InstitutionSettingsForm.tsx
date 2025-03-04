'use client';

import { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Grid, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { InstitutionWithDriveConfig } from '@/types/institution';

interface InstitutionSettingsFormProps {
  institution: InstitutionWithDriveConfig;
}

export default function InstitutionSettingsForm({ institution }: InstitutionSettingsFormProps) {
  const driveConfig = institution.driveConfig || {
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    refreshToken: '',
    serviceAccountKey: '',
    serviceAccountEmail: '',
    sharedDriveId: '',
    maxMicrophones: 5,
    membershipText: "Declaro que sou membro desta instituição",
    imageRightsText: "Autorizo o uso da minha imagem",
    bibleVersions: ["NVI", "ACF", "ARA"],
  };

  const [formData, setFormData] = useState({
    name: institution.name || '',
    driveConfig: {
      clientId: driveConfig.clientId,
      clientSecret: driveConfig.clientSecret,
      redirectUri: driveConfig.redirectUri,
      refreshToken: driveConfig.refreshToken,
      serviceAccountKey: driveConfig.serviceAccountKey,
      serviceAccountEmail: driveConfig.serviceAccountEmail,
      sharedDriveId: driveConfig.sharedDriveId,
      maxMicrophones: driveConfig.maxMicrophones,
      membershipText: driveConfig.membershipText,
      imageRightsText: driveConfig.imageRightsText,
      bibleVersions: driveConfig.bibleVersions,
    },
  });

  const [newBibleVersion, setNewBibleVersion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Submitting formData:', formData); // Debug log
      const response = await fetch(`/api/institutions/${institution.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update institution settings');
      }

      const result = await response.json();
      console.log('Update result:', result); // Debug log

      alert('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating institution settings:', error);
      alert('Erro ao atualizar as configurações');
    }
  };

  const handleAddBibleVersion = () => {
    if (newBibleVersion && !formData.driveConfig.bibleVersions.includes(newBibleVersion)) {
      setFormData({
        ...formData,
        driveConfig: {
          ...formData.driveConfig,
          bibleVersions: [...formData.driveConfig.bibleVersions, newBibleVersion],
        },
      });
      setNewBibleVersion('');
    }
  };

  const handleRemoveBibleVersion = (version: string) => {
    setFormData({
      ...formData,
      driveConfig: {
        ...formData.driveConfig,
        bibleVersions: formData.driveConfig.bibleVersions.filter((v) => v !== version),
      },
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Informações Básicas
            </Typography>
            <TextField
              fullWidth
              label="Nome da Instituição"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Configurações do Google Drive
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Client ID"
              value={formData.driveConfig.clientId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driveConfig: { ...formData.driveConfig, clientId: e.target.value },
                })
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Client Secret"
              type="password"
              value={formData.driveConfig.clientSecret}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driveConfig: { ...formData.driveConfig, clientSecret: e.target.value },
                })
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Service Account Email"
              value={formData.driveConfig.serviceAccountEmail}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driveConfig: { ...formData.driveConfig, serviceAccountEmail: e.target.value },
                })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Service Account Key (JSON)"
              multiline
              rows={4}
              value={formData.driveConfig.serviceAccountKey}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driveConfig: { ...formData.driveConfig, serviceAccountKey: e.target.value },
                })
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Shared Drive ID"
              value={formData.driveConfig.sharedDriveId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driveConfig: { ...formData.driveConfig, sharedDriveId: e.target.value },
                })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Configurações do Formulário
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Quantidade Máxima de Microfones"
              value={formData.driveConfig.maxMicrophones}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driveConfig: {
                    ...formData.driveConfig,
                    maxMicrophones: Number(e.target.value),
                  },
                })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Texto de Declaração de Membro"
              value={formData.driveConfig.membershipText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driveConfig: {
                    ...formData.driveConfig,
                    membershipText: e.target.value,
                  },
                })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Texto de Autorização de Imagem"
              value={formData.driveConfig.imageRightsText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driveConfig: {
                    ...formData.driveConfig,
                    imageRightsText: e.target.value,
                  },
                })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Versões da Bíblia Disponíveis
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {formData.driveConfig.bibleVersions.map((version) => (
                <Chip
                  key={version}
                  label={version}
                  onDelete={() => handleRemoveBibleVersion(version)}
                  color="primary"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Nova Versão"
                value={newBibleVersion}
                onChange={(e) => setNewBibleVersion(e.target.value)}
                size="small"
              />
              <IconButton
                color="primary"
                onClick={handleAddBibleVersion}
                disabled={!newBibleVersion}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Salvar Configurações
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
