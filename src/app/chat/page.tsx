"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const Chat = () => {
  const { data: session } = useSession(); // Usando useSession para autenticação
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

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

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded shadow-lg h-96 overflow-y-scroll">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-4">
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      {session?.user ? (
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
      ) : (
        <p>Você precisa estar autenticado para enviar mensagens.</p>
      )}
    </div>
  );
};

export default Chat;
