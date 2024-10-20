"use client";

import React, { useState } from "react";

const driveId = process.env.NEXT_PUBLIC_SHARED_DRIVE_ID;

const Page = () => {
  const [folderId, setFolderId] = useState<string | undefined>(
    process.env.NEXT_PUBLIC_SHARED_DRIVE_ID
  );
  const [folderName, setFolderName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const createFolder = async () => {
    const body = {
      folderId: driveId,
      folderName,
    };

    const res = await fetch("/api/createFolder", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await res.json();

    const id = data.folder.data.id;
    const link = `https://drive.google.com/drive/folders/${id}`;

    // redirect to folder link
    const win = window.open(link, "_blank");
    win!.focus();
  };

  const uploadFile = async () => {
    if (!file) return;

    // Verifica se o folderId é válido antes de usar
    if (!folderId) {
      alert("O ID da pasta não está definido.");
      return;
    }

    const formData = new FormData();
    formData.append("folderId", folderId); // Garante que folderId é sempre string
    formData.append("file", file);
    formData.append("driveId", driveId || "");

    const res = await fetch("/api/uploadFile", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    const link = data.fileLink?.webViewLink || undefined;

    // redirect to file link
    if (!link) return;

    const win = window.open(link, "_blank");
    win!.focus();
  };

  return (
    <div>
      <div>
        <h1>Create Folder</h1>

        <input
          type="text"
          placeholder="Folder Name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />

        <button onClick={createFolder}>Create Folder</button>
      </div>

      <div>
        <h1>Upload File</h1>

        <input
          type="text"
          placeholder="Parent Folder ID"
          value={folderId || ""} // teste aqui
          onChange={(e) => setFolderId(e.target.value)}
        />

        <input
          type="file"
          placeholder="File"
          onChange={(e) => setFile(e.target.files![0])}
        />

        <button onClick={uploadFile}>Upload File</button>
      </div>
    </div>
  );
};

export default Page;
