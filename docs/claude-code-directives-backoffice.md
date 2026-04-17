# 🧠 Directives Claude Code — Back-Office Creahub

## Contexte technique

- **Framework** : Next.js (App Router)
- **BDD** : Neon PostgreSQL via **Prisma**
- **Auth** : déjà en place
- **Tables existantes** : `User`, `Role` (Admin / Collaborateur / Client)
- **Stockage fichiers** : VPS (upload local ou API dédiée)
- **Objectif** : back-office de gestion de projet entre Corinne (admin) et ses clients

---

## 📌 Règles globales à donner à Claude Code

```
Tu travailles sur une application Next.js avec App Router, Prisma et Neon PostgreSQL.
Les tables `User` et `Role` existent déjà avec les rôles : ADMIN, COLLABORATEUR, CLIENT.
Pour chaque fonctionnalité :
1. Commence par mettre à jour le schéma Prisma
2. Génère la migration SQL
3. Crée les Server Actions ou API Routes nécessaires
4. Crée les composants React associés
5. Protège chaque route selon le rôle (middleware ou vérification session)
Ne modifie jamais les tables User et Role existantes.
```

---

## 🗂️ BLOC 1 — Projets

### Prompt Claude Code :

```
Crée la fonctionnalité "Projets" :

Schéma Prisma à ajouter :
- Project : id, name, description, status (DRAFT/ACTIVE/ARCHIVED), tjm (Float, taux journalier en €), createdAt, updatedAt
- Relation Project → User (client assigné, rôle CLIENT)
- Relation Project → User[] (collaborateurs, rôle COLLABORATEUR, max 2)

À créer :
1. Migration Prisma
2. Server Actions : createProject, updateProject, archiveProject, getProjects, getProjectById
3. Page admin `/admin/projets` : liste tous les projets avec statut + client assigné
4. Page `/admin/projets/nouveau` : formulaire de création (nom, description, TJM, assignation client)
5. Page `/admin/projets/[id]` : vue détail projet
6. Page client `/client/projets` : liste les projets du client connecté uniquement
7. Protège toutes les routes : ADMIN voit tout, CLIENT voit uniquement ses projets
```

---

## 🔖 BLOC 2 — Phases & Tâches

### Prompt Claude Code :

```
Crée la fonctionnalité "Phases et Tâches" liée aux projets :

Schéma Prisma à ajouter :
- Phase : id, name, order (Int), projectId, createdAt
- Task : id, title, description (String, texte riche HTML), status (TODO/IN_PROGRESS/DONE/VALIDATED), phaseId, createdAt, updatedAt

À créer :
1. Migration Prisma
2. Server Actions : createPhase, updatePhase, deletePhase, createTask, updateTask, updateTaskStatus, deleteTask
3. Composant `PhaseBoard` : affiche les phases d'un projet avec leurs tâches (style kanban ou liste)
4. Composant `TaskCard` : titre, statut, description courte, bouton voir détail
5. Page `/admin/projets/[id]/taches` : vue complète phases + tâches
6. Modal ou page `/admin/projets/[id]/taches/[taskId]` : édition complète d'une tâche
7. Le client peut voir les tâches et leur statut mais ne peut pas les créer
8. Ajouter un éditeur rich text (TipTap) pour le champ description des tâches
```

---

## ✅ BLOC 3 — To-do list dans une tâche

### Prompt Claude Code :

```
Ajoute un système de checklist dans les tâches :

Schéma Prisma à ajouter :
- TodoItem : id, label, checked (Boolean), order (Int), taskId

À créer :
1. Migration Prisma
2. Server Actions : addTodoItem, toggleTodoItem, deleteTodoItem, reorderTodoItems
3. Composant `TaskChecklist` : liste de to-do avec case à cocher, ajout inline, suppression, réordonnancement (drag & drop optionnel)
4. Intégrer ce composant dans la vue détail d'une tâche
5. Afficher une barre de progression (ex: 3/5 complétés)
6. Admin et client peuvent interagir avec la checklist
```

---

## ⏱️ BLOC 4 — Time Tracking

### Prompt Claude Code :

```
Crée le système de suivi du temps par tâche :

Schéma Prisma à ajouter :
- TimeSession : id, taskId, userId, startedAt (DateTime), endedAt (DateTime?), durationMinutes (Int?)

À créer :
1. Migration Prisma
2. Server Actions :
   - startSession(taskId) → crée une session avec startedAt = now()
   - stopSession(sessionId) → calcule durationMinutes = diff(endedAt - startedAt)
   - getSessions(taskId)
3. Composant `Chronometer` : bouton Start/Pause/Reprendre, affiche le temps en cours en live (timer JS), liste les sessions passées avec durée
4. Calcul du coût : utiliser le TJM du projet (base 8h = 480 min), calculer le coût à la minute : coût = (durationMinutes / 480) * tjm
5. Afficher dans la tâche : temps total passé + coût total en €
6. Page récap `/admin/projets/[id]/temps` : tableau de toutes les tâches avec temps et coût, total projet en bas
7. Cette vue récap est aussi accessible au client (lecture seule)
```

---

## 📎 BLOC 5 — Pièces jointes

### Prompt Claude Code :

```
Crée le système d'upload de fichiers attachés aux tâches :

Schéma Prisma à ajouter :
- Attachment : id, taskId, uploadedByUserId, filename, originalName, mimeType, size (Int), uploadedAt

À créer :
1. Migration Prisma
2. API Route `/api/upload` : reçoit un FormData, sauvegarde le fichier sur le VPS dans /uploads/[projectId]/[taskId]/, retourne le chemin relatif
3. Server Action : deleteAttachment(attachmentId)
4. Composant `AttachmentUploader` : drag & drop ou bouton upload, liste les fichiers existants avec icône selon type, bouton télécharger, bouton supprimer (admin seulement)
5. Intégrer dans la vue détail d'une tâche
6. Admin et client peuvent uploader, seul l'admin peut supprimer
```

---

## 📄 BLOC 6 — Documents & Comptes rendus

### Prompt Claude Code :

```
Crée un espace de documents texte avec export PDF par projet :

Schéma Prisma à ajouter :
- Document : id, projectId, title, content (String, HTML), authorId, createdAt, updatedAt

À créer :
1. Migration Prisma
2. Server Actions : createDocument, updateDocument, deleteDocument, getDocuments
3. Page `/admin/projets/[id]/documents` : liste des documents du projet
4. Page `/admin/projets/[id]/documents/[docId]` : éditeur TipTap pour rédiger le document
5. Bouton "Exporter en PDF" : utilise la lib `@react-pdf/renderer` ou appel API avec `puppeteer` pour générer le PDF côté serveur
6. Page client `/client/projets/[id]/documents` : lecture seule + bouton télécharger PDF
7. Protège l'accès : un client ne voit que les documents de ses projets
```

---

## 💬 BLOC 7 — Messagerie

### Prompt Claude Code :

```
Crée un fil de messagerie simple par projet :

Schéma Prisma à ajouter :
- Message : id, projectId, authorId, content (String), createdAt

À créer :
1. Migration Prisma
2. Server Actions : sendMessage(projectId, content), getMessages(projectId)
3. Composant `MessageThread` : fil de messages avec auteur, date, contenu. Les messages de l'admin à droite, les autres à gauche.
4. Formulaire d'envoi en bas du fil, soumission via Server Action
5. Rafraîchissement automatique toutes les 15 secondes (polling simple avec setInterval + router.refresh())
6. Intégrer dans la page projet, onglet ou sidebar "Messages"
7. Tous les membres du projet (admin + client + collaborateurs) peuvent lire et envoyer des messages
```

---

## 📊 BLOC 8 — Dashboard Admin

### Prompt Claude Code :

```
Crée le dashboard principal de l'admin :

Page `/admin/dashboard` à créer :
1. Carte "Projets actifs" : nombre de projets en statut ACTIVE
2. Carte "Temps total facturé ce mois" : somme des durationMinutes de toutes les sessions du mois en cours, converti en heures
3. Carte "Revenus estimés ce mois" : calcul basé sur les sessions + TJM des projets
4. Tableau "Dernières tâches modifiées" : 5 dernières tâches updatedAt avec projet, statut, temps passé
5. Tableau "Projets en cours" : liste avec client, progression (% tâches DONE+VALIDATED / total), temps passé, coût
6. Utilise uniquement des Server Components et des requêtes Prisma directes pour les données
```

---

## 🔐 Rappel des règles d'accès (à inclure dans chaque prompt)

```
Règles d'accès à respecter dans toutes les routes et actions :
- ADMIN : accès total à tout
- CLIENT : accès uniquement à ses projets, lecture des tâches/temps/coûts, upload fichiers, messagerie, téléchargement documents
- COLLABORATEUR : accès aux projets où il est assigné, peut modifier les tâches et la checklist, messagerie
Utilise la session pour vérifier le rôle à chaque Server Action et Route Handler.
```
