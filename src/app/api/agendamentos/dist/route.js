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
exports.POST = exports.GET = exports.dynamic = void 0;
// app/api/bookings/route.ts
var server_1 = require("next/server");
var client_1 = require("@prisma/client");
var cache_1 = require("next/cache");
var next_auth_1 = require("next-auth");
var route_1 = require("@/app/api/auth/[...nextauth]/route");
var prisma = new client_1.PrismaClient();
cache_1.unstable_noStore();
exports.dynamic = "force-dynamic";
function GET() {
    return __awaiter(this, void 0, void 0, function () {
        var session, bookings, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, next_auth_1.getServerSession(route_1.authOptions)];
                case 1:
                    session = _a.sent();
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 })];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, 5, 7]);
                    return [4 /*yield*/, prisma.booking.findMany({
                            where: { isActive: true },
                            include: { room: true, department: true, user: true }
                        })];
                case 3:
                    bookings = _a.sent();
                    response = server_1.NextResponse.json(bookings);
                    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                    response.headers.set('Pragma', 'no-cache');
                    response.headers.set('Expires', '0');
                    response.headers.set('Surrogate-Control', 'no-store');
                    return [2 /*return*/, response];
                case 4:
                    error_1 = _a.sent();
                    console.error("Erro ao buscar agendamentos:", error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: "Erro ao buscar os agendamentos." }, { status: 500 })];
                case 5: return [4 /*yield*/, prisma.$disconnect()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
function POST(req) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, roomId, departmentId, startTime, endTime, observation, userId, phone, conflictingBooking, booking, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, 5, 7]);
                    return [4 /*yield*/, req.json()];
                case 1:
                    _a = _b.sent(), roomId = _a.roomId, departmentId = _a.departmentId, startTime = _a.startTime, endTime = _a.endTime, observation = _a.observation, userId = _a.userId, phone = _a.phone;
                    return [4 /*yield*/, prisma.booking.findFirst({
                            where: {
                                roomId: roomId,
                                startTime: { lte: new Date(endTime) },
                                endTime: { gte: new Date(startTime) }
                            }
                        })];
                case 2:
                    conflictingBooking = _b.sent();
                    if (conflictingBooking) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "A sala já está ocupada neste horário." }, { status: 400 })];
                    }
                    return [4 /*yield*/, prisma.booking.create({
                            data: {
                                roomId: roomId,
                                departmentId: departmentId,
                                startTime: new Date(startTime),
                                endTime: new Date(endTime),
                                userId: userId,
                                observation: observation,
                                phone: phone,
                                status: "pending",
                                isActive: true
                            }
                        })];
                case 3:
                    booking = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json(booking)];
                case 4:
                    error_2 = _b.sent();
                    console.error("Erro ao criar agendamento:", error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: "Erro ao criar agendamento." }, { status: 500 })];
                case 5: return [4 /*yield*/, prisma.$disconnect()];
                case 6:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
