"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ClearAllIcon from "@mui/icons-material/ClearAll";

// Definindo o tipo de cada mensagem
type Message = {
  id: string;
  text: string;
  user: string;
  createdAt: Date;
  userEmail: string;
};

const Chat = () => {
  const { data: session } = useSession(); // Usando useSession para autenticação
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]); // Definindo o tipo das mensagens
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState("");

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Permissão para notificações concedida.");
        } else {
          console.log("Permissão para notificações negada.");
        }
      });
    }
  }, []);

  // Função para mostrar a notificação
  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "/chat-icon.png", // Opcional: caminho para um ícone para a notificação
      });
    }
  };

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text, // Garantindo que todos os campos estão presentes
          user: data.user,
          createdAt: data.createdAt.toDate(), // Transformar Timestamp em Date
          userEmail: data.userEmail,
        } as Message; // Tipando explicitamente como Message
      });
      setMessages(newMessages);

      // Verifica se a nova mensagem é de outra pessoa
      const lastMessage = newMessages[newMessages.length - 1];
      if (
        session?.user &&
        lastMessage &&
        lastMessage?.user !== session.user.name
      ) {
        showNotification(
          `Nova mensagem de ${lastMessage?.user || ""}`,
          lastMessage?.text || ""
        );
      }
    });
    return () => unsubscribe();
  }, [session]);

  const sendMessage = async () => {
    if (message.trim() !== "" && session?.user) {
      await addDoc(collection(db, "messages"), {
        text: message,
        user: session.user.name, // Usando o nome do usuário do session
        createdAt: new Date(),
        userEmail: session.user.email, // Usando o email do usuário para referência, se necessário
      });
      setMessage("");
    }
  };
  // Editar uma mensagem existente
  const handleEditMessage = async (id: string) => {
    const messageRef = doc(db, "messages", id);
    await updateDoc(messageRef, {
      text: editedMessage,
    });
    setEditMessageId(null); // Sai do modo de edição
  };

  // Remover uma mensagem específica
  const handleDeleteMessage = async (id: string) => {
    const confirmDelete = confirm(
      "Tem certeza de que deseja remover esta mensagem?"
    );
    if (!confirmDelete) return;

    const messageRef = doc(db, "messages", id);
    await deleteDoc(messageRef);
  };

  // Limpar todo o histórico de mensagens
  const handleClearMessages = async () => {
    const confirmClear = confirm(
      "Tem certeza de que deseja limpar todas as mensagens?"
    );
    if (!confirmClear) return;

    // Utilizando getDocs para obter todos os documentos da coleção
    const messagesSnapshot = await getDocs(collection(db, "messages"));
    messagesSnapshot.docs.forEach(async (messageDoc) => {
      await deleteDoc(messageDoc.ref);
    });
  };

  return (
    <div className="container mx-auto p-4">
      {/* Verifica se o usuário está logado */}
      {!session?.user ? (
        // Exibe o botão de login se não estiver logado
        <div className="text-center mt-8">
          <p>Você precisa estar autenticado para acessar o chat.</p>
          <Button variant="contained" color="primary" onClick={() => signIn()}>
            Login
          </Button>
        </div>
      ) : (
        // Exibe o chat se o usuário estiver logado
        <>
          <div className="text-right mb-4">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => signOut()}
            >
              Logout
            </Button>
          </div>

          <div className="bg-white p-6 rounded shadow-lg h-96 overflow-y-scroll">
            {messages.map((msg) => (
              <div key={msg.id} className="mb-4">
                {editMessageId === msg.id ? (
                  <div>
                    <TextField
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                      fullWidth
                    />
                    <IconButton
                      onClick={() => handleEditMessage(msg.id)}
                      color="primary"
                    >
                      <SaveIcon />
                    </IconButton>
                  </div>
                ) : (
                  <>
                    <strong>{msg.user}:</strong> {msg.text}
                  </>
                )}

                {/* Controles de admin para editar/remover */}
                {session?.user?.isAdmin && (
                  <div>
                    <IconButton
                      onClick={() => {
                        setEditMessageId(msg.id);
                        setEditedMessage(msg.text);
                      }}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteMessage(msg.id)}
                      color="secondary"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex">
            <TextField
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              fullWidth
            />
            <Button onClick={sendMessage} variant="contained" className="ml-2">
              Send
            </Button>
          </div>

          {/* Botão de limpar histórico para admins */}
          {session?.user?.isAdmin && (
            <div className="mt-4">
              <Button
                onClick={handleClearMessages}
                variant="contained"
                color="secondary"
                startIcon={<ClearAllIcon />}
              >
                Limpar Histórico
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Chat;
