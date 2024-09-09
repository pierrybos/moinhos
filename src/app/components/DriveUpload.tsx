import React, { useEffect, useState } from "react";

const DriveUpload = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Inicializa o cliente Google API
  useEffect(() => {
    const initializeGoogleAPI = () => {
      window.gapi.load("client:auth2", async () => {
        await window.gapi.client.init({
          apiKey: process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_CLIENT_ID,
          clientId: process.env.GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/drive.file",
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
        });

        const authInstance = window.gapi.auth2.getAuthInstance();
        setIsSignedIn(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(setIsSignedIn);
      });
    };

    // Verifica se o Google API script está carregado e inicializa
    if (window.gapi) {
      initializeGoogleAPI();
    } else {
      // Aguarda o carregamento do script e inicializa
      const interval = setInterval(() => {
        if (window.gapi) {
          clearInterval(interval);
          initializeGoogleAPI();
        }
      }, 100);
    }
  }, []);

  // Funções para login, logout e upload
  const handleLogin = () => {
    window.gapi.auth2.getAuthInstance().signIn();
  };

  const handleLogout = () => {
    window.gapi.auth2.getAuthInstance().signOut();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const metadata = {
      name: file.name,
      mimeType: file.type,
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    const accessToken = window.gapi.auth.getToken().access_token;
    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
        body: form,
      }
    );

    const data = await response.json();
    console.log("Uploaded file ID:", data.id);
  };

  return (
    <div>
      {isSignedIn ? (
        <>
          <button onClick={handleLogout}>Logout</button>
          <input type="file" onChange={handleFileUpload} />
        </>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
};

export default DriveUpload;
