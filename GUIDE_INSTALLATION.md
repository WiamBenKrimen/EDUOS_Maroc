# 🚀 Guide d'Installation et de Démarrage complet - EDUOS Maroc

Ce document contient toutes les étapes simples pas-à-pas pour installer, configurer et lancer la plateforme **EDUOS Maroc** (avec le système de messagerie **WhatsApp Web Multi-Directeur**) sur n'importe quel ordinateur après avoir cloné le projet.

---

## 📋 1. Prérequis Système

Avant de commencer, vérifiez que votre ordinateur dispose des éléments suivants installés :

- 🟢 **Node.js** (v18 ou supérieur) → [Télécharger Node.js](https://nodejs.org/)
- 🐍 **Python** (v3.10 ou supérieur) → [Télécharger Python](https://www.python.org/)
- 🐳 **Docker Desktop** (pour le serveur WhatsApp Evolution API) → [Télécharger Docker](https://www.docker.com/)
- 🐘 **PostgreSQL** (ou via Docker) → Base de données locale

---

## 🛠️ 2. Étape 1 : Préparation de la Base de Données (PostgreSQL)

1. Assurez-vous que PostgreSQL est démarré sur le port `5432`.
2. Créez la base de données nommée `eduos` avec l'utilisateur `postgres` et mot de passe `postgres`.

---

## 💬 3. Étape 2 : Lancement du Serveur WhatsApp (Evolution API)

Vous avez **deux méthodes simples au choix** pour démarrer le serveur WhatsApp (Evolution API) :

### Option A : Lancement local sans Docker avec `npm start` (Recommandé si vous avez le dossier evolution-api)
1. Ouvrez un terminal et allez dans le dossier `evolution-api` :
```powershell
cd C:\Users\user\Desktop\evolution-api
```
2. Lancez le serveur :
```powershell
npm start
```
*(Assurez-vous que le fichier `.env` dans `evolution-api` contient `PORT=8081` et `AUTHENTICATION_API_KEY=eduos-evolution-key-2026`)*.

---

### Option B : Lancement avec Docker
Si vous préférez utiliser Docker, lancez simplement cette commande dans votre terminal :
```powershell
docker run -d `
  --name evolution-api `
  -p 8081:8081 `
  -e SERVER_URL=http://localhost:8081 `
  -e AUTHENTICATION_TYPE=apikey `
  -e AUTHENTICATION_API_KEY=eduos-evolution-key-2026 `
  -e DATABASE_ENABLED=true `
  -e DATABASE_SAVE_DATA_INSTANCE=true `
  -e DATABASE_SAVE_DATA_NEW_MESSAGE=true `
  -e DATABASE_SAVE_MESSAGE_UPDATE=true `
  -e DATABASE_SAVE_DATA_CONTACTS=true `
  -e DATABASE_SAVE_DATA_CHATS=true `
  atendecare/evolution-api:v2.2.0
```

> 💡 **Vérification** : Rendez-vous sur `http://localhost:8081` pour vérifier que le service WhatsApp réponde.

---

## ⚙️ 4. Étape 3 : Installation & Lancement du Backend (FastAPI)

1. Ouvrez un terminal PowerShell et allez dans le dossier `backend` :

```powershell
cd C:\Users\user\Desktop\EDUOS_Maroc\backend
```

2. Créez et activez l'environnement virtuel Python :

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

3. Installez toutes les dépendances :

```powershell
pip install -r requirements.txt
pip install python-multipart asyncpg fastapi uvicorn requests
```

4. Créez ou vérifiez le fichier `.env` dans le dossier `backend` :

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eduos
PORT=3001
SECRET_KEY=eduos-super-secret-key-2026
EVOLUTION_API_URL=http://localhost:8081
EVOLUTION_API_KEY=eduos-evolution-key-2026
EVOLUTION_API_INSTANCE=eduos-whatsapp
```

5. Initialisez la base de données (si ce n'est pas déjà fait) :

```powershell
python seed_nadia.py
```

6. Lancez le serveur Backend sur le port `3001` :

```powershell
python -m uvicorn eduos.api.app:app --host 0.0.0.0 --port 3001 --reload
```

---

## 🎨 5. Étape 4 : Installation & Lancement du Frontend (Next.js)

1. Ouvrez un **deuxième terminal** et allez dans le dossier `front` :

```powershell
cd C:\Users\user\Desktop\EDUOS_Maroc\front
```

2. Installez les paquets npm :

```powershell
npm install
```

3. Créez ou vérifiez le fichier `.env.local` dans le dossier `front` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Lancez l'application Web sur le port `3000` :

```powershell
npm run dev
```

---

## 🎉 6. Étape 5 : Utilisation de l'Application & Connexion WhatsApp

1. Ouvrez votre navigateur sur **[http://localhost:3000/login](http://localhost:3000/login)**.
2. Connectez-vous avec les identifiants Directeur :
   - **Email** : `directeur@eduos.ma` (ou compte Directeur enregistré)
   - **Mot de passe** : `password123`
3. Rendez-vous dans la section **Messages WhatsApp** (`http://localhost:3000/directeur/messages`).
4. Cliquez sur **"📱 Connecter WhatsApp"**.
5. **Scannez le QR Code** directement affiché sur votre écran avec WhatsApp sur votre téléphone (*Paramètres → Appareils liés → Associer un appareil*).
6. Dès la connexion établie (badge vert 🟢 **WhatsApp Connecté**) :
   - 💬 Vous pouvez discuter en direct avec les apprenants et membres du personnel.
   - 📄 Vous pouvez envoyer des **documents PDF** (consultables et téléchargeables en 1 clic).
   - 🖼️ Vous pouvez envoyer et recevoir des **photos** affichées directement dans les bulles.
   - 🎙️ Vous pouvez **enregistrer et écouter des messages vocaux (Audios)** directement depuis l'interface !

---

## 🆘 Dépannage rapide (En cas de problème)

| Problème | Solution |
|---|---|
| **Erreur de connexion Backend (Port 3001)** | Vérifiez que le venv est activé et que uvicorn tourne sur le port `3001`. |
| **WhatsApp ne génère pas de QR Code** | Assurez-vous que le conteneur Docker `evolution-api` tourne bien sur le port `8081`. |
| **Le micro ou les fichiers ne s'envoient pas** | Vérifiez que `python-multipart` est bien installé (`pip install python-multipart`). |
