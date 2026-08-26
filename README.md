# 📅 Personal Agenda - Real-Time Personal Manager

**Personal Agenda** è una web application full-stack progettata per gestire compiti, appuntamenti e note in modo intuitivo attraverso un'interfaccia moderna e reattiva con funzionalità di Drag & Drop. 
Costruita con un'architettura moderna per supportare aggiornamenti in tempo reale e notifiche push, l'app è completamente installabile su desktop e mobile come **PWA** (Progressive Web App).

<img width="400" height="800" alt="WhatsApp Image 2026-08-27 at 00 51 21" src="https://github.com/user-attachments/assets/57cea4bd-788c-4f04-b9a0-b4e6fb1fec78" />





## ✨ Funzionalità Principali

- **Drag & Drop Fluido**: Organizza i tuoi compiti tra i giorni della settimana con un semplice trascinamento.
- **Sincronizzazione Real-Time (WebSocket)**: Apri l'agenda su PC e telefono contemporaneamente; ogni modifica si riflette in tempo reale ovunque.
- **Notifiche Push**: Ricevi promemoria direttamente sul tuo dispositivo.
- **PWA (Progressive Web App)**: Installabile su smartphone (iOS/Android) e Desktop, con tanto di icona nativa e funzionamento in background.
- **Sicurezza Avanzata**: Accesso protetto con password cifrata (Bcrypt) e Autenticazione a Due Fattori (MFA / TOTP).
- **Design Moderno (Glassmorphism)**: Interfaccia utente curata, animazioni fluide e feedback visivi immediati.

---

## 🚀 Tecnologie Utilizzate

Questo progetto adotta una robusta architettura full-stack:

### 🎨 Frontend (React)
- **React.js & Vite**: Per un'interfaccia fulminea e modulare.
- **dnd-kit**: Gestione avanzata e accessibile del Drag & Drop.
- **Service Workers**: Per il caching offline e la ricezione di notifiche Push.
- **Vanilla CSS**: Stili custom, animazioni chiave (Keyframes) ed effetti glassmorfici.

### ⚙️ Backend (Python)
- **FastAPI**: Framework backend moderno e ad altissime prestazioni per le API REST.
- **WebSockets (Socket.IO)**: Per la comunicazione bidirezionale in tempo reale.
- **SQLAlchemy (PostgreSQL / SQLite)**: ORM per la gestione del database (Postgres per il cloud, SQLite per lo sviluppo locale).
- **PyWebPush**: Per la crittografia e l'invio sicuro delle notifiche push.

---

## 🧠 Metodologia di Sviluppo (AI Pair Programming)
Questo progetto è stato architettato, sviluppato e debuggato adottando un flusso di lavoro **AI Pair Programming**. 
L'obiettivo è stato concentrarsi sulla definizione dei requisiti, sulla progettazione architetturale (System Design) e sulla gestione del ciclo di vita del software, guidando un assistente AI nella stesura e nel refactoring del codice. 

---

## 📦 Installazione e Avvio (Locale)

Vuoi far girare l'Agenda sul tuo computer? Ecco come fare:

1. **Clona il repository**:
   ```bash
   git clone https://github.com/SimoneAvella/personal-agenda.git
   cd personal-agenda
   ```

2. **Backend (Python)**:
   ```bash
   pip install -r requirements.txt
   # Avvia il server FastAPI (con Uvicorn)
   uvicorn Backend.Backend_main:app --reload
   ```

3. **Frontend (Node.js)**:
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

## 🌍 Deploy
L'applicazione è configurata per il deploy continuo (CI/CD) su piattaforme Cloud come **Render**, tramite il `Procfile` e lo script di build dedicato.

---
*Progetto personale realizzato da Simone Avella.*
