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
var ProtectedRoute_1 = require("../../components/ProtectedRoute");
var useSnackbar_1 = require("../../components/useSnackbar");
var CustomSnackbar_1 = require("../../components/CustomSnackbar");
var AdminBookings = function () {
    var _a = react_1.useState([]), bookings = _a[0], setBookings = _a[1];
    var _b = react_1.useState(null), expanded = _b[0], setExpanded = _b[1];
    var _c = react_1.useState({}), statusUpdate = _c[0], setStatusUpdate = _c[1];
    var _d = react_1.useState({}), observationUpdate = _d[0], setObservationUpdate = _d[1];
    var _e = react_1.useState({}), phoneUpdate = _e[0], setPhoneUpdate = _e[1];
    var _f = react_1.useState({}), editMode = _f[0], setEditMode = _f[1];
    var _g = useSnackbar_1.useSnackbar(), openSnackbar = _g.openSnackbar, snackbarProps = _g.snackbarProps;
    react_1.useEffect(function () {
        var fetchBookings = function () { return __awaiter(void 0, void 0, void 0, function () {
            var res, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/agendamentos")];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        data = _a.sent();
                        setBookings(data);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchBookings();
    }, []);
    var handleUpdate = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var newStatus, newObservation, newPhone, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newStatus = statusUpdate[id];
                    newObservation = observationUpdate[id];
                    newPhone = phoneUpdate[id];
                    return [4 /*yield*/, fetch("/api/agendamento/" + id, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                status: newStatus,
                                observation: newObservation,
                                phone: newPhone
                            })
                        })];
                case 1:
                    res = _a.sent();
                    if (res.ok) {
                        setBookings(function (prev) {
                            return prev.map(function (booking) {
                                return booking.id === id
                                    ? __assign(__assign({}, booking), { status: newStatus || booking.status, observation: newObservation || booking.observation, phone: newPhone || booking.phone }) : booking;
                            });
                        });
                        openSnackbar("Atualizações salvas com sucesso!", "success");
                        setEditMode(function (prev) {
                            var _a;
                            return (__assign(__assign({}, prev), (_a = {}, _a[id] = false, _a)));
                        });
                    }
                    else {
                        openSnackbar("Erro ao salvar as atualizações.", "warning");
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(ProtectedRoute_1["default"], null,
        react_1["default"].createElement(material_1.Container, { maxWidth: "lg" },
            react_1["default"].createElement(material_1.Typography, { variant: "h4", component: "h1", gutterBottom: true }, "Administra\u00E7\u00E3o de Agendamentos"),
            react_1["default"].createElement(material_1.Grid, { container: true, spacing: 2 }, bookings.map(function (booking) { return (react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, sm: 6, md: 4, key: booking.id },
                react_1["default"].createElement(material_1.List, null,
                    react_1["default"].createElement(material_1.ListItem, { onClick: function () {
                            return setExpanded(expanded === booking.id ? null : booking.id);
                        }, sx: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        } },
                        react_1["default"].createElement(material_1.ListItemText, { primary: booking.room.name, secondary: new Date(booking.startTime).toLocaleDateString() + " - " + booking.department.name }),
                        react_1["default"].createElement(material_1.IconButton, { onClick: function () {
                                return setExpanded(expanded === booking.id ? null : booking.id);
                            } }, expanded === booking.id ? (react_1["default"].createElement(ExpandLess_1["default"], null)) : (react_1["default"].createElement(ExpandMore_1["default"], null)))),
                    react_1["default"].createElement(material_1.Collapse, { "in": expanded === booking.id, timeout: "auto", unmountOnExit: true },
                        react_1["default"].createElement(material_1.Box, { p: 2, border: 1, borderRadius: 4, mb: 2 },
                            react_1["default"].createElement(material_1.Typography, { variant: "subtitle1", gutterBottom: true }, "Detalhes do Agendamento"),
                            react_1["default"].createElement(material_1.Divider, null),
                            react_1["default"].createElement(material_1.Typography, null,
                                "Solicitante: ",
                                booking.user.name),
                            react_1["default"].createElement(material_1.Typography, null,
                                "Telefone:",
                                " ",
                                editMode[booking.id] ? (react_1["default"].createElement(material_1.TextField, { value: phoneUpdate[booking.id] || booking.phone || "", onChange: function (e) {
                                        var _a;
                                        return setPhoneUpdate(__assign(__assign({}, phoneUpdate), (_a = {}, _a[booking.id] = e.target.value, _a)));
                                    }, fullWidth: true })) : (booking.phone || "N/A")),
                            react_1["default"].createElement(material_1.Box, { mt: 2 },
                                react_1["default"].createElement(material_1.Typography, { variant: "subtitle1", gutterBottom: true }, "Status"),
                                react_1["default"].createElement(material_1.FormControl, { fullWidth: true },
                                    react_1["default"].createElement(material_1.Select, { value: statusUpdate[booking.id] || booking.status, onChange: function (e) {
                                            var _a;
                                            return setStatusUpdate(__assign(__assign({}, statusUpdate), (_a = {}, _a[booking.id] = e.target.value, _a)));
                                        } },
                                        react_1["default"].createElement(material_1.MenuItem, { value: "pending" }, "Pendente"),
                                        react_1["default"].createElement(material_1.MenuItem, { value: "approved" }, "Aprovado"),
                                        react_1["default"].createElement(material_1.MenuItem, { value: "cancelled" }, "Cancelado")))),
                            react_1["default"].createElement(material_1.Box, { mt: 2 },
                                react_1["default"].createElement(material_1.Typography, { variant: "subtitle1", gutterBottom: true }, "Observa\u00E7\u00F5es"),
                                react_1["default"].createElement(material_1.TextField, { value: observationUpdate[booking.id] ||
                                        booking.observation ||
                                        "", onChange: function (e) {
                                        var _a;
                                        return setObservationUpdate(__assign(__assign({}, observationUpdate), (_a = {}, _a[booking.id] = e.target.value, _a)));
                                    }, multiline: true, rows: 3, variant: "outlined", fullWidth: true })),
                            react_1["default"].createElement(material_1.Box, { mt: 2 },
                                react_1["default"].createElement(material_1.Button, { variant: "contained", color: "primary", onClick: function () { return handleUpdate(booking.id); } }, "Salvar"),
                                react_1["default"].createElement(material_1.Button, { variant: "contained", color: "secondary", onClick: function () {
                                        var _a;
                                        return setEditMode(__assign(__assign({}, editMode), (_a = {}, _a[booking.id] = !editMode[booking.id], _a)));
                                    } }, editMode[booking.id] ? "Cancelar" : "Editar"))))))); }))),
        react_1["default"].createElement(CustomSnackbar_1["default"], __assign({}, snackbarProps))));
};
exports["default"] = AdminBookings;
