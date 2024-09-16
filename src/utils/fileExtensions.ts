// fileExtensions.ts

// Definindo as listas de extensões de arquivo permitidas
const imageExtensionList = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".svg", ".webp", ".ico", ".heic"];
const videoExtensionList = [".mp4", ".avi", ".mov", ".wmv", ".mkv", ".flv", ".webm", ".m4v", ".3gp", ".mpeg", ".ogv"];
const audioExtensionList = [".mp3", ".wav", ".aac", ".flac", ".ogg", ".wma", ".m4a"];
const presentationExtensionList = [".ppt", ".pptx", ".pdf", ".odp"];

// Função que retorna todas as extensões permitidas combinadas em um único array
export const getAllExtensions = (): string[] => [
    ...imageExtensionList,
    ...videoExtensionList,
    ...audioExtensionList,
    ...presentationExtensionList,
];

// Funções para retornar listas específicas (opcional, mas útil para manutenções futuras)
export const getImageExtensions = (): string[] => imageExtensionList;
export const getVideoExtensions = (): string[] => videoExtensionList;
export const getAudioExtensions = (): string[] => audioExtensionList;
export const getPresentationExtensions = (): string[] => presentationExtensionList;

