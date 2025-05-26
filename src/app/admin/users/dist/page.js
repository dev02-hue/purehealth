// components/admin/UserManagement.tsx
'use client';
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
var framer_motion_1 = require("framer-motion");
var fa_1 = require("react-icons/fa");
var md_1 = require("react-icons/md");
var user_1 = require("@/lib/admin/user");
function UserManagement() {
    var _this = this;
    var _a = react_1.useState([]), users = _a[0], setUsers = _a[1];
    var _b = react_1.useState(true), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(''), error = _c[0], setError = _c[1];
    var _d = react_1.useState(''), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = react_1.useState(''), editingUserId = _e[0], setEditingUserId = _e[1];
    var _f = react_1.useState({}), passwordUpdates = _f[0], setPasswordUpdates = _f[1];
    var _g = react_1.useState({}), profileUpdates = _g[0], setProfileUpdates = _g[1];
    react_1.useEffect(function () {
        var fetchUsers = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, users, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        setLoading(true);
                        return [4 /*yield*/, user_1.getAllUsers()];
                    case 1:
                        _a = _b.sent(), users = _a.users, error = _a.error;
                        if (error) {
                            setError(error);
                        }
                        else {
                            setUsers(users.filter(function (user) { return user.auth.email !== undefined; }));
                        }
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchUsers();
    }, []);
    var filteredUsers = users.filter(function (user) {
        var _a, _b;
        return ((_a = user.auth.email) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) || ((_b = user.profile.phone_number) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.profile.first_name + " " + user.profile.last_name).toLowerCase().includes(searchTerm.toLowerCase());
    });
    var handlePasswordUpdate = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var _a, success, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!passwordUpdates[userId]) {
                        setError('Please enter a new password');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, user_1.updateUserPassword(userId, passwordUpdates[userId])];
                case 1:
                    _a = _b.sent(), success = _a.success, error = _a.error;
                    if (success) {
                        setPasswordUpdates(function (prev) {
                            var _a;
                            return (__assign(__assign({}, prev), (_a = {}, _a[userId] = '', _a)));
                        });
                        setEditingUserId('');
                    }
                    else {
                        setError(error || 'Failed to update password');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteUser = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var _a, success, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!window.confirm('Are you sure you want to delete this user?'))
                        return [2 /*return*/];
                    return [4 /*yield*/, user_1.deleteUser(userId)];
                case 1:
                    _a = _b.sent(), success = _a.success, error = _a.error;
                    if (success) {
                        setUsers(function (prev) { return prev.filter(function (user) { return user.auth.id !== userId; }); });
                    }
                    else {
                        setError(error || 'Failed to delete user');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handleProfileUpdate = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var updates, _a, success, error, users_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    updates = profileUpdates[userId];
                    if (!updates)
                        return [2 /*return*/];
                    return [4 /*yield*/, user_1.updateUserProfile(userId, updates)];
                case 1:
                    _a = _b.sent(), success = _a.success, error = _a.error;
                    if (!success) return [3 /*break*/, 3];
                    setProfileUpdates(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[userId] = {}, _a)));
                    });
                    setEditingUserId('');
                    return [4 /*yield*/, user_1.getAllUsers()];
                case 2:
                    users_1 = (_b.sent()).users;
                    setUsers(users_1.filter(function (user) { return user.auth.email !== undefined; }));
                    return [3 /*break*/, 4];
                case 3:
                    setError(error || 'Failed to update profile');
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "p-4 bg-white rounded-lg shadow" },
        React.createElement("h2", { className: "text-2xl font-bold mb-6 flex items-center gap-2" },
            React.createElement(md_1.MdAdminPanelSettings, { className: "text-blue-500" }),
            "User Management"),
        error && (React.createElement("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2" },
            React.createElement(fa_1.FaTimes, null),
            error)),
        React.createElement("div", { className: "mb-6 relative" },
            React.createElement("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" },
                React.createElement(fa_1.FaSearch, { className: "text-gray-400" })),
            React.createElement("input", { type: "text", placeholder: "Search users by name, email or phone...", className: "pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } })),
        loading ? (React.createElement("div", { className: "flex justify-center items-center h-32" },
            React.createElement(fa_1.FaSpinner, { className: "animate-spin text-blue-500 text-2xl mr-3" }),
            React.createElement("span", null, "Loading users..."))) : (React.createElement("div", { className: "overflow-x-auto" },
            React.createElement("table", { className: "min-w-full divide-y divide-gray-200" },
                React.createElement("thead", { className: "bg-gray-50" },
                    React.createElement("tr", null,
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "User"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Contact"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Balance"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Joined"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Actions"))),
                React.createElement("tbody", { className: "bg-white divide-y divide-gray-200" }, filteredUsers.map(function (user) { return (React.createElement(framer_motion_1.motion.tr, { key: user.auth.id, initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, className: "hover:bg-gray-50" },
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("div", { className: "font-medium text-gray-900" },
                            user.profile.first_name,
                            " ",
                            user.profile.last_name),
                        React.createElement("div", { className: "text-sm text-gray-500" }, user.profile.referral_code)),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("div", { className: "text-sm text-gray-900" }, user.auth.email),
                        React.createElement("div", { className: "text-sm text-gray-500" }, user.profile.phone_number)),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" },
                        "$",
                        user.profile.balance.toLocaleString()),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" }, new Date(user.auth.created_at).toLocaleDateString()),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium" },
                        React.createElement("div", { className: "flex space-x-2" }, editingUserId === user.auth.id ? (React.createElement(React.Fragment, null,
                            React.createElement("button", { onClick: function () { return handlePasswordUpdate(user.auth.id); }, className: "text-green-600 hover:text-green-900 p-1" },
                                React.createElement(fa_1.FaCheck, null)),
                            React.createElement("button", { onClick: function () { return setEditingUserId(''); }, className: "text-red-600 hover:text-red-900 p-1" },
                                React.createElement(fa_1.FaTimes, null)))) : (React.createElement(React.Fragment, null,
                            React.createElement("button", { onClick: function () { return setEditingUserId(user.auth.id); }, className: "text-blue-600 hover:text-blue-900 p-1" },
                                React.createElement(fa_1.FaUserEdit, null)),
                            React.createElement("button", { onClick: function () { return handleDeleteUser(user.auth.id); }, className: "text-red-600 hover:text-red-900 p-1" },
                                React.createElement(fa_1.FaTrash, null)),
                            React.createElement("button", { onClick: function () { return handleProfileUpdate(user.auth.id); }, className: "text-yellow-600 hover:text-yellow-900 p-1" },
                                React.createElement(fa_1.FaKey, null)))))))); })))))));
}
exports["default"] = UserManagement;
