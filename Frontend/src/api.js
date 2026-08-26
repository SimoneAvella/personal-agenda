import axios from "axios";
import { io } from "socket.io-client";

// Determina se siamo in sviluppo o produzione
export const API_BASE_URL = "https://mia-agenda.onrender.com";
export const BASE_URL = import.meta.env.DEV ? API_BASE_URL : "";

// Configura axios per includere il token se presente
const api = axios.create({
  baseURL: BASE_URL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("agenda_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginStep1(password) {
  const res = await api.post(`/auth/login`, { password });
  return res.data;
}

export async function loginStep2(password, code, remember) {
  const res = await api.post(`/auth/mfa`, { password, code, remember });
  if (res.data.token) {
    localStorage.setItem("agenda_token", res.data.token);
  }
  return res.data;
}

export async function checkAuth() {
  const token = localStorage.getItem("agenda_token");
  if (!token) return false;

  const maxRetries = 30; // 30 tentativi ≈ 2.5‑3 minuti
  const retryDelay = 5000; // 5 secondi tra i tentativi

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await api.get(`/auth/check`, { timeout: 8000 });
      return res.data.status === "ok";
    } catch (e) {
      const status = e.response?.status;

      // 401 = token davvero scaduto o non valido → esci
      if (status === 401) {
        console.warn("Token non valido o scaduto. Logout.");
        return false;
      }

      // 503 = DB temporaneamente non disponibile (Render si sveglia) → riprova
      // Qualsiasi altro errore di rete/timeout → riprova
      if (i < maxRetries - 1) {
        console.log(`Server in risveglio... (${i + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, retryDelay));
        continue;
      }
      return false;
    }
  }
  return false;
}

export function logout() {
  localStorage.removeItem("agenda_token");
}

export async function getTasks() {
  const res = await api.get(`/tasks?t=${Date.now()}`);
  return res.data;
}

export async function updateTasks(tasks) {
  const res = await api.post(`/tasks`, tasks);
  return res.data;
}

export async function moveTaskAPI(from_date, to_date, task_id) {
  const res = await api.post(`/move_task`, {
    from_date,
    to_date,
    task_id
  });
  return res.data;
}

export async function addTask(task) {
  const res = await api.post(`/task`, task);
  return res.data;
}

export async function patchTask(id, changes) {
  const res = await api.patch(`/task/${encodeURIComponent(id)}`, changes);
  return res.data;
}

export async function deleteTask(id) {
  const res = await api.delete(`/task/${encodeURIComponent(id)}`);
  return res.data;
}

export function initSocket(onTaskCreated, onTaskUpdated, onTaskDeleted) {
  const token = localStorage.getItem("agenda_token");
  if (!token) return null;

  const socket = io(`${API_BASE_URL}`, {
    path: "/ws/socket.io",
    auth: { token },
    transports: ["websocket"]
  });

  socket.on("connect", () => console.log("🔗 WS connected"));
  socket.on("disconnect", () => console.log("❌ WS disconnected"));

  socket.on("task_created", payload => {
    if (onTaskCreated) onTaskCreated(payload);
  });
  
  socket.on("task_updated", payload => {
    if (onTaskUpdated) onTaskUpdated(payload);
  });
  
  socket.on("task_deleted", payload => {
    if (onTaskDeleted) onTaskDeleted(payload);
  });

  return socket;
}