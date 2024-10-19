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
var material_1 = require("@mui/material");
function Schedule() {
    var _this = this;
    var _a = react_1.useState([]), rooms = _a[0], setRooms = _a[1];
    var _b = react_1.useState([]), departments = _b[0], setDepartments = _b[1];
    var _c = react_1.useState(""), selectedRoom = _c[0], setSelectedRoom = _c[1];
    var _d = react_1.useState(""), selectedDepartment = _d[0], setSelectedDepartment = _d[1];
    var _e = react_1.useState(""), startTime = _e[0], setStartTime = _e[1];
    var _f = react_1.useState(""), endTime = _f[0], setEndTime = _f[1];
    var _g = react_1.useState(""), observation = _g[0], setObservation = _g[1];
    react_1.useEffect(function () {
        fetch("/api/salas")
            .then(function (res) { return res.json(); })
            .then(function (data) { return setRooms(data); });
        fetch("/api/departamentos")
            .then(function (res) { return res.json(); })
            .then(function (data) { return setDepartments(data); });
    }, []);
    var handleBooking = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("/api/agendamentos", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            roomId: selectedRoom,
                            departmentId: selectedDepartment,
                            startTime: startTime,
                            endTime: endTime,
                            observation: observation,
                            userId: "userId from session"
                        })
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "container mx-auto p-4" },
        React.createElement("h1", { className: "text-2xl font-bold mb-4" }, "Agendar Sala"),
        React.createElement("div", { className: "flex space-x-4 mb-4" },
            React.createElement(material_1.FormControl, { className: "flex-1" },
                React.createElement(material_1.InputLabel, null, "Sala"),
                React.createElement(material_1.Select, { value: selectedRoom, onChange: function (e) { return setSelectedRoom(e.target.value); } }, rooms.map(function (room) { return (React.createElement(material_1.MenuItem, { key: room.id, value: room.id }, room.name)); }))),
            React.createElement(material_1.FormControl, { className: "flex-1" },
                React.createElement(material_1.InputLabel, null, "Departamento"),
                React.createElement(material_1.Select, { value: selectedDepartment, onChange: function (e) { return setSelectedDepartment(e.target.value); } }, departments.map(function (department) { return (React.createElement(material_1.MenuItem, { key: department.id, value: department.id }, department.name)); })))),
        React.createElement("div", { className: "flex space-x-4 mb-4" },
            React.createElement(material_1.TextField, { label: "Data e Hora de In\u00EDcio", type: "datetime-local", value: startTime, onChange: function (e) { return setStartTime(e.target.value); }, className: "flex-1", InputLabelProps: {
                    shrink: true
                } }),
            React.createElement(material_1.TextField, { label: "Data e Hora de Fim", type: "datetime-local", value: endTime, onChange: function (e) { return setEndTime(e.target.value); }, className: "flex-1", InputLabelProps: {
                    shrink: true
                } })),
        React.createElement("div", { className: "flex space-x-4 mb-4" },
            React.createElement(material_1.TextField, { label: "Observa\u00E7\u00F5es", multiline: true, rows: 4, value: observation, onChange: function (e) { return setObservation(e.target.value); }, className: "flex-1", variant: "outlined" })),
        React.createElement(material_1.Button, { variant: "contained", color: "primary", onClick: handleBooking }, "Agendar")));
}
exports["default"] = Schedule;
