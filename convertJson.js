// script to convert json to string (save as convert-json.js)
const fs = require("fs");
const path = require("path");

// Caminho para o arquivo JSON da chave
const filePath = path.join(__dirname, "./src/private/key.json");

// Leitura do arquivo JSON
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Erro ao ler o arquivo JSON:", err);
    return;
  }

  // Converte o JSON para uma string usando JSON.stringify
  const jsonString = JSON.stringify(JSON.parse(data));

  console.log("String JSON:", jsonString);
  // A string pode ser copiada e colada como variável de ambiente na Vercel
});
