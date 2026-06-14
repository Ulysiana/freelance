# Plan correctif — creahub-solutions.fr
> Prompt pour Claude Code · Refonte homepage

---

## Contexte

Site Next.js de Corinne, développeuse freelance full-stack sous le nom **Creahub Solutions**.
URL : https://creahub-solutions.fr

Objectif de cette session : refondre la page d'accueil (`/`) uniquement.
La page `/hebergeurs` (Expertises) est exclue — elle sera retravaillée séparément.

---

## Modifications à effectuer

### 1. Meta / SEO — remplacer partout `590 €/j` par `75 €/h`

Fichier(s) concerné(s) : head de la page d'accueil (meta description, og:description, twitter:description, og:title si mentionné).

- `meta-description` : remplacer `100 % remote · 590 €/j` → `100 % remote · 75 €/h`
- `og:description` : remplacer `100 % remote · 590 €/j` → `100 % remote · 75 €/h`
- `twitter:description` : même correction
- `title` de la page : supprimer toute mention de tarif si présente

---

### 2. Navigation — supprimer "Espace client"

Retirer le lien `Espace client` (`/login`) de la navigation principale.
Le déplacer dans le footer si le lien doit rester accessible, sinon supprimer.

---

### 3. Hero — réécriture complète

**Supprimer :**
- La mention `590 €/j` dans le bandeau au-dessus du H1
- La liste de technos en sous-titre : `Python · React · Node · Rust · WordPress · Shopify · GCP · AWS · Azure · Neon.`
- La phrase `Autodidacte depuis les années 2000. Passionnée. Soirs & week-ends.`

**Remplacer par :**

```
# Bandeau overline (petit texte au-dessus du H1)
Développement web · SaaS · Apps desktop & mobile · 75 €/h HT · 100 % remote

# H1
Je conçois et développe vos projets web, SaaS et applications — de l'idée à la mise en production.

# Sous-titre (1 ligne max)
Full-stack indépendante. Communication asynchrone. Réponse sous 24 h.

# CTA principal
Parler de votre projet →  (ancre #contact)

# CTA secondaire
Voir mes réalisations  (ancre #projects)
```

---

### 4. Section "Mes offres" — restructurer en 3 services

Remplacer les 4 cartes actuelles (Projet client / Pack Audit / Pack Migration / Pack Build) par **3 services** :

---

**Service 1 — Projet sur mesure**
Label : `Projet sur mesure`
Prix : `75 €/h HT`
Description : `Développement web, back-end, intégrations API et architecture cloud. Je prends en charge votre projet de bout en bout.`
Points :
- Sites web & landing pages (Next.js, WordPress, Shopify)
- Applications web & SaaS (React, Python, Node)
- Apps desktop (Tauri) & mobile
- Déploiement cloud (GCP, AWS, Azure) & Linux
- Intégrations API & migrations de bases de données

CTA : `Discuter de votre projet →` (ancre #contact)

---

**Service 2 — Forfait Audit**
Label : `Audit & Diagnostic`
Prix : `À partir de 490 €`
Description : `Un état des lieux complet de votre site ou application, avec un rapport priorisé et des recommandations actionnables.`
Points :
- Audit SEO technique & sémantique
- Performance & Core Web Vitals
- Revue de code & architecture
- UX & parcours utilisateur
- Rapport livré + restitution incluse

CTA : `Demander un audit →` (ancre #contact)

---

**Service 3 — Migration & Transfert**
Label : `Migration & Transfert`
Prix : `À partir de 790 €`
Description : `Migration sécurisée de votre site, base de données ou boutique — sans perte de données ni downtime.`
Points :
- Migration WordPress (hébergeur, thème, plugins)
- Migration & refonte Shopify
- Migration de base de données
- Audit des risques avant migration
- Tests de non-régression & validation

CTA : `Parler de ma migration →` (ancre #contact)

---

### 5. Section "Mon histoire" — retirer "Soirs & week-ends"

Dans la section `Façon de travailler` (liste de badges/tags) :

**Supprimer :**
- `Soirs & week-ends disponibles`

**Remplacer par :**
- `Communication asynchrone` (déjà présent — garder)
- `Réponse sous 24 h` (nouveau badge à ajouter)

Le reste de la section histoire est à conserver tel quel.

---

### 6. Section "Réalisations" — réécrire les descriptions

**Carte locationshygge.com**
Titre : `Moteur de réservation · Locations Hygge`
Nouvelle description : `Site de réservation conçu de zéro pour 3 gîtes en montagne. Réservations 100 % en direct, sans commission Booking ni Airbnb. Calendriers synchronisés, logique de prix dynamique, déployé sur Cloud Run.`
Tags : conserver (Python · React · Neon · Cloud Run)

**Carte difyzi.com**
Titre : `SaaS PDF · Difyzi`
Nouvelle description : `Application web de manipulation de PDF développée de A à Z et mise en production. Fusion, compression, conversion — traitements Python et Rust pour les opérations performantes.`
Tags : conserver (React · Python · Rust)

**Carte mymhypnose.fr**
Titre : `Migration VPS · mymhypnose.fr`
Nouvelle description : `Formation WordPress pour rendre le client totalement autonome sur son site. Migration cPanel → VPS Linux : base de données, fichiers, bascule DNS Cloudflare — zéro downtime, zéro perte.`
Tags : conserver (WordPress · Linux VPS · Cloudflare DNS)

Modifier aussi le chapeau de section :
Actuel : `Deux projets aboutis de bout en bout — conception, développement, mise en production.`
Nouveau : `Projets livrés de bout en bout — conception, développement, mise en production.`

---

### 7. Section contact — corriger les infos

Dans le bloc sous le formulaire (3 icônes) :

**Icône 2 — réécrire :**
Actuel : `100 % remote — Je travaille à distance exclusivement — soirs et week-ends inclus. Pas de déplacement.`
Nouveau : `100 % remote — Je travaille à distance exclusivement. Communication asynchrone, réponse sous 24 h.`

Le reste (réponse 24h, premier échange gratuit) est à conserver.

---

### 8. Footer — mise à jour tarif

Si `590 €/j` ou mention de TJM apparaît dans le footer, remplacer par `75 €/h HT`.

---

## Ce qu'il NE faut PAS toucher

- La page `/hebergeurs` (Expertises) — exclue de cette session
- Le design général, les couleurs, les fonts — ne pas modifier
- La page `/cgv` et `/partenariat` — exclues
- Le formulaire de contact — conserver tel quel
- La section "Stack & compétences" (liste de tags technos) dans "Mon histoire" — conserver
- La photo de Corinne — conserver
- Le texte narratif de la section "Mon histoire" (les 4 paragraphes) — conserver

---

## Ordre d'exécution recommandé

1. Meta / head (tarif + title)
2. Navigation (supprimer Espace client)
3. Hero (réécriture)
4. Section offres (restructuration 3 services)
5. Section histoire (supprimer "Soirs & week-ends", ajouter "Réponse sous 24h")
6. Section réalisations (réécriture descriptions)
7. Section contact (réécrire icône remote)
8. Footer (vérifier tarif)
9. Vérification globale : grep sur `590` et `soirs` pour s'assurer qu'il ne reste aucune occurrence
