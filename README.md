# HackMeAI

HackMeAI c'est mon projet de chat avec une IA locale.

J'ai fait ça avec un frontend en Next.js et un backend en FastAPI. Le frontend
sert à afficher les pages, gérer la connexion et envoyer les questions. Le
backend sert à vérifier les clés, gérer les utilisateurs, garder l'historique et
appeler le modèle IA local avec llama.cpp.

L'idée principale c'est que le navigateur ne parle pas directement au modèle ni
à la base de données. Il passe par Next.js, puis Next.js parle à FastAPI.

## Structure

Le projet est séparé comme ça:

- `frontend`: l'interface en Next.js / React
- `backend`: l'API en Python avec FastAPI

J'ai séparé ça parce que c'est plus simple à comprendre et aussi plus sécuritaire.
Les clés ne restent pas dans le code du navigateur.

## Fonctionnement général

Quand quelqu'un envoie une question:

1. il se connecte avec une clé API
2. Next.js met la clé dans un cookie HTTP-only
3. la page chat envoie la question à une route Next.js
4. Next.js appelle FastAPI avec le header `APIKEY`
5. FastAPI vérifie la clé dans la base
6. FastAPI vérifie les limites
7. FastAPI ajoute l'historique
8. FastAPI appelle llama.cpp
9. la réponse est sauvegardée et renvoyée au frontend

## Backend

Dans le backend, j'ai mis:

- la création d'utilisateurs
- la génération des clés API
- le hash des clés avant de les garder en base
- la vérification des clés utilisateur et admin
- l'historique des conversations
- les limites de requêtes
- le quota de tokens
- l'appel au modèle IA local

Pour la base, j'utilise SQLite en local pour que le projet parte facilement. Si
je veux une version plus complète, je peux brancher MySQL avec les variables dans
`.env`.

## Frontend

Le frontend contient:

- connexion utilisateur
- chat
- historique
- connexion admin
- création d'utilisateur
- déconnexion

Les routes dans `frontend/src/app/api` servent de lien entre l'interface et le
backend. Comme ça, les clés restent côté serveur.

## Lancer le backend

```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Test rapide:

```text
http://127.0.0.1:8000/sante
```

Si ça retourne `{"status":"ok"}`, le backend est lancé.

## Lancer le frontend

```powershell
cd frontend
npm install
npm run dev
```

Le frontend est sur:

```text
http://localhost:3000
```

Dans `frontend/.env.local`, il faut:

```text
FASTAPI_URL=http://127.0.0.1:8000
```

## Admin local

Pour la démo, la clé admin est:

```text
allo
```

Je l'entre dans `/admin/connexion`, puis je peux créer un utilisateur. La clé
utilisateur retournée commence par `hmai_`.

## Problèmes que j'ai corrigés

Au départ, le projet essayait de se connecter à MySQL sans identifiant, donc ça
donnait une erreur du genre:

```text
Access denied for user 'zacha'@'localhost' (using password: NO)
```

J'ai réglé ça en mettant SQLite par défaut en local.

J'ai aussi ajouté une clé admin dans le `.env`, parce que sans `ADMIN_API_KEY`,
la création d'utilisateur retournait une erreur.

J'ai aussi nettoyé le ZIP parce qu'il y avait beaucoup de fichiers inutiles:

- `node_modules`
- `.next`
- `.venv`
- fichiers `.pyc`
- caches
- un starter Next.js en trop
- un fichier Python qui contenait du JavaScript