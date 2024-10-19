"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var material_1 = require("@mui/material");
var ExpandMore_1 = require("@mui/icons-material/ExpandMore");
var ExpandLess_1 = require("@mui/icons-material/ExpandLess");
var react_2 = require("next-auth/react");
var ProtectedRoute_1 = require("@/app/components/ProtectedRoute");
var UserBookings = function () {
    var session = react_2.useSession().data;
    var _a = react_1.useState([]), bookings = _a[0], setBookings = _a[1];
    var _b = react_1.useState(null), expanded = _b[0], setExpanded = _b[1];
    react_1.useEffect(function () {
        var fetchBookings = function () { return __awaiter(void 0, void 0, void 0, function () {
            var res, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(session === null || session === void 0 ? void 0 : session.user)) return [3 /*break*/, 3];
                        return [4 /*yield*/, fetch("/api/agendamentos", {
                                method: "GET",
                                credentials: "include"
                            })];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        data = _a.sent();
                        setBookings(data);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        fetchBookings();
    }, [session]);
    var handleExpandToggle = function (id) {
        setExpanded(function (prev) { return (prev === id ? null : id); });
    };
    var getStatusStyle = function (status) {
        switch (status) {
            case "approved":
                return {
                    color: "#388e3c",
                    border: "1px solid #388e3c",
                    backgroundColor: "#e8f5e9"
                };
            case "cancelled":
                return {
                    color: "#d32f2f",
                    border: "1px solid #d32f2f",
                    backgroundColor: "#ffebee"
                };
            case "pending":
            default:
                return {
                    color: "#616161",
                    border: "1px solid #616161",
                    backgroundColor: "#f5f5f5"
                };
        }
    };
    return (react_1["default"].createElement(ProtectedRoute_1["default"], null,
        react_1["default"].createElement(material_1.Container, { maxWidth: "md" },
            react_1["default"].createElement(material_1.Typography, { variant: "h4", component: "h1", gutterBottom: true }, "Meus Agendamentos"),
            react_1["default"].createElement(material_1.List, null, bookings.length === 0 ? (react_1["default"].createElement(material_1.Typography, null, "Voc\u00EA ainda n\u00E3o fez nenhum agendamento.")) : (bookings.map(function (booking) { return (react_1["default"].createElement(material_1.ListItem, { key: booking.id, onClick: function () { return handleExpandToggle(booking.id); } },
                react_1["default"].createElement(material_1.ListItemText, { primary: booking.room.name, secondary: new Date(booking.startTime).toLocaleDateString() + " - " + booking.department.name }),
                react_1["default"].createElement(material_1.Chip, { label: booking.status, size: "small", sx: __assign(__assign({}, getStatusStyle(booking.status)), { marginLeft: "10px" }) }),
                react_1["default"].createElement(material_1.IconButton, { onClick: function () { return handleExpandToggle(booking.id); } }, expanded === booking.id ? (react_1["default"].createElement(ExpandLess_1["default"], null)) : (react_1["default"].createElement(ExpandMore_1["default"], null))),
                react_1["default"].createElement(material_1.Collapse, { "in": expanded === booking.id, timeout: "auto", unmountOnExit: true },
                    react_1["default"].createElement(material_1.Box, { p: 2, border: 1, borderRadius: 4, mt: 2 },
                        react_1["default"].createElement(material_1.Typography, { variant: "subtitle1" }, "Detalhes do Agendamento"),
                        react_1["default"].createElement(material_1.Divider, null),
                        react_1["default"].createElement(material_1.Typography, null,
                            "Data de In\u00EDcio:",
                            " ",
                            new Date(booking.startTime).toLocaleString()),
                        react_1["default"].createElement(material_1.Typography, null,
                            "Data de Fim: ",
                            new Date(booking.endTime).toLocaleString()),
                        react_1["default"].createElement(material_1.Typography, null,
                            "Departamento: ",
                            booking.department.name),
                        react_1["default"].createElement(material_1.Typography, { mt: 2 },
                            "Observa\u00E7\u00F5es: ",
                            booking.observation || "Sem observações"))))); }))))));
};
exports["default"] = UserBookings;
