# Tests fonctionnels

J'ai mis mes tests fonctionnels ici parce que c'était demandé dans le dossier
`dev`.

J'ai pas fait ça en grille, parce que je trouve que c'est plus facile à lire en
notes normales. Le but c'est de montrer que j'ai testé les vraies fonctions du
projet, pas juste que les pages ouvrent.

Avant de commencer les tests, je pars le backend et le frontend:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

```powershell
cd frontend
npm run dev
```

Je garde aussi ces valeurs pour la démo:

```text
Backend: http://127.0.0.1:8000
Frontend: http://localhost:3000
Clé admin: change-moi-admin-local
```

## Tests de départ

1. Je teste si le backend est vivant.
J'ouvre `http://127.0.0.1:8000/sante`. Je dois recevoir `{"status":"ok"}`.

2. Je teste si le frontend ouvre.
J'ouvre `http://localhost:3000`. La page doit charger sans erreur Next.js.

3. Je teste la config entre Next.js et FastAPI.
Dans `frontend/.env.local`, je vérifie que `FASTAPI_URL` pointe vers
`http://127.0.0.1:8000`. Si ce n'est pas bon, les appels API doivent tomber en
erreur parce que le frontend ne rejoint pas FastAPI.

4. Je teste le démarrage sans MySQL.
Je lance le backend sans config MySQL. Le projet doit partir avec SQLite local
et ne pas redonner l'erreur `Access denied for user`.

## Tests de connexion et de routes

5. Je teste l'accueil sans être connecté.
J'ouvre `/`. Je dois être redirigé vers `/connexion`.

6. Je teste la page chat sans session.
J'ouvre `/chat` sans cookie utilisateur. Je dois retourner vers `/connexion`.

7. Je teste l'historique sans session.
J'ouvre `/historique` sans cookie utilisateur. Je dois retourner vers
`/connexion`.

8. Je teste la page admin sans session admin.
J'ouvre `/admin/utilisateurs`. Je dois être envoyé vers `/admin/connexion`.

9. Je teste une mauvaise clé utilisateur.
J'entre une valeur qui ne commence pas par `hmai_`. Le formulaire doit refuser
la connexion.

10. Je teste une clé utilisateur au bon format.
J'entre une clé qui commence par `hmai_` et qui est assez longue. Le frontend
peut créer la session, mais la vraie validation se fait quand FastAPI reçoit la
clé.

11. Je teste la déconnexion utilisateur.
Après une connexion, je clique sur déconnexion. Le cookie utilisateur doit être
supprimé et je dois revenir vers la connexion.

12. Je teste la connexion admin avec une valeur vide.
J'envoie le formulaire admin sans clé. Je dois avoir une erreur.

13. Je teste la connexion admin avec la clé locale.
J'entre `change-moi-admin-local`. Je dois pouvoir accéder à la page de création
d'utilisateur.

14. Je teste la déconnexion admin.
Je clique sur déconnexion côté admin. Après ça, `/admin/utilisateurs` doit me
renvoyer vers `/admin/connexion`.

## Tests de création d'utilisateur

15. Je teste la création d'un utilisateur valide.
Je mets un nom, un email valide et un quota. Je dois recevoir un utilisateur
créé avec une clé qui commence par `hmai_`.

16. Je vérifie que la clé utilisateur complète est affichée.
Après la création, la clé doit apparaître dans l'interface. C'est important parce
qu'elle n'est pas stockée en clair dans la base.

17. Je teste un email invalide.
Je mets un email sans format valide. FastAPI doit refuser avec une erreur de
validation.

18. Je teste un nom trop court.
Je mets un nom avec seulement 1 caractère. FastAPI doit refuser.

19. Je teste un quota négatif.
Je mets `-1` comme quota. FastAPI doit refuser.

20. Je teste un quota trop grand.
Je mets une valeur plus grande que `1000000`. FastAPI doit refuser.

21. Je teste un email déjà utilisé.
Je crée deux utilisateurs avec le même email. Le deuxième essai doit retourner
une erreur de conflit.

22. Je teste la création sans clé admin.
J'appelle `/utilisateurs` sans le header `ADMINKEY`. FastAPI doit retourner une
erreur d'autorisation.

23. Je teste la création avec une mauvaise clé admin.
J'appelle `/utilisateurs` avec un mauvais `ADMINKEY`. FastAPI doit refuser.

24. Je vérifie que la clé API n'est pas gardée en clair.
Après la création, la table des clés doit garder le hash et pas la vraie clé
complète.

## Tests du chat

25. Je teste un appel chat sans `APIKEY`.
J'appelle `/questionner` sans header `APIKEY`. FastAPI doit refuser.

26. Je teste un appel chat avec une fausse clé.
J'appelle `/questionner` avec une clé qui n'existe pas en base. FastAPI doit
refuser.

27. Je teste un prompt vide.
J'envoie un contenu vide. FastAPI doit retourner une erreur de validation.

28. Je teste une intention vide.
J'envoie `intention` vide. FastAPI doit retourner une erreur de validation.

29. Je teste `max_tokens` trop bas.
J'envoie `max_tokens=0`. FastAPI doit refuser.

30. Je teste `max_tokens` trop haut.
J'envoie `max_tokens=501`. FastAPI doit refuser, parce que la limite est 500.

31. Je teste un vrai appel chat avec une clé valide.
Je crée un utilisateur, je prends sa clé `hmai_...`, puis j'envoie une question.
Si llama.cpp est lancé, je dois recevoir une réponse et un `conversation_id`.

32. Je teste le cas où llama.cpp n'est pas lancé.
Je coupe llama.cpp et j'envoie une question avec une clé valide. FastAPI doit
retourner une erreur claire au lieu de planter.

33. Je teste que l'historique continue.
J'envoie une première question, je garde le `conversation_id`, puis j'envoie une
deuxième question avec ce même id. La conversation doit continuer.

34. Je teste la lecture de l'historique.
Avec un `conversation_id` valide, j'appelle la route historique. Je dois revoir
les messages de la conversation.

35. Je teste un mauvais `conversation_id`.
J'appelle l'historique avec un id invalide ou qui n'appartient pas à
l'utilisateur. FastAPI doit refuser ou retourner introuvable.

## Tests de limites

36. Je teste le rate limit.
J'envoie plus de 5 questions en moins de 60 secondes avec le même utilisateur.
FastAPI doit retourner une erreur `429`.

37. Je teste le quota de tokens.
Je mets un petit quota à un utilisateur et je dépasse ce quota. FastAPI doit
retourner une erreur `429`.

38. Je teste une requête trop grosse.
J'envoie un JSON plus gros que `MAX_BODY_SIZE`. Le backend doit retourner une
erreur `413`.

39. Je teste plusieurs appels IA en même temps.
Je lance deux demandes en parallèle. Le backend doit limiter les appels au
modèle avec le sémaphore, au lieu d'envoyer trop de requêtes à llama.cpp.

40. Je teste les timeouts.
Je simule un llama.cpp trop lent ou non disponible. FastAPI doit retourner une
erreur propre au lieu de rester bloqué.

## Conclusion

Avec ces tests-là, je couvre les parties importantes:

- démarrage du projet
- connexion utilisateur
- connexion admin
- création d'utilisateur
- validation des données
- sécurité des clés
- chat
- historique
- erreurs du modèle IA
- rate limit
- quota
- limite de taille des requêtes

Il y a plus que 30 cas, donc ça couvre mieux le projet au complet.
