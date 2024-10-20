"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var driveId = process.env.NEXT_PUBLIC_SHARED_DRIVE_ID;
var Page = function () {
    var _a = react_1.useState(process.env.NEXT_PUBLIC_SHARED_DRIVE_ID), folderId = _a[0], setFolderId = _a[1];
    var _b = react_1.useState(""), folderName = _b[0], setFolderName = _b[1];
    var _c = react_1.useState(null), file = _c[0], setFile = _c[1];
    var createFolder = function () { return __awaiter(void 0, void 0, void 0, function () {
        var body, res, data, id, link, win;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = {
                        folderId: driveId,
                        folderName: folderName
                    };
                    return [4 /*yield*/, fetch("/api/createFolder", {
                            method: "POST",
                            body: JSON.stringify(body)
                        })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    id = data.folder.data.id;
                    link = "https://drive.google.com/drive/folders/" + id;
                    win = window.open(link, "_blank");
                    win.focus();
                    return [2 /*return*/];
            }
        });
    }); };
    var uploadFile = function () { return __awaiter(void 0, void 0, void 0, function () {
        var formData, res, data, link, win;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!file)
                        return [2 /*return*/];
                    // Verifica se o folderId é válido antes de usar
                    if (!folderId) {
                        alert("O ID da pasta não está definido.");
                        return [2 /*return*/];
                    }
                    formData = new FormData();
                    formData.append("folderId", folderId); // Garante que folderId é sempre string
                    formData.append("file", file);
                    formData.append("driveId", driveId || "");
                    return [4 /*yield*/, fetch("/api/uploadFile", {
                            method: "POST",
                            body: formData
                        })];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _b.sent();
                    link = ((_a = data.fileLink) === null || _a === void 0 ? void 0 : _a.webViewLink) || undefined;
                    // redirect to file link
                    if (!link)
                        return [2 /*return*/];
                    win = window.open(link, "_blank");
                    win.focus();
                    return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement("div", null,
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h1", null, "Create Folder"),
            react_1["default"].createElement("input", { type: "text", placeholder: "Folder Name", value: folderName, onChange: function (e) { return setFolderName(e.target.value); } }),
            react_1["default"].createElement("button", { onClick: createFolder }, "Create Folder")),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h1", null, "Upload File"),
            react_1["default"].createElement("input", { type: "text", placeholder: "Parent Folder ID", value: folderId || "", onChange: function (e) { return setFolderId(e.target.value); } }),
            react_1["default"].createElement("input", { type: "file", placeholder: "File", onChange: function (e) { return setFile(e.target.files[0]); } }),
            react_1["default"].createElement("button", { onClick: uploadFile }, "Upload File"))));
};
exports["default"] = Page;
