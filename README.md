# Lumen — école en ligne (edu-zenith-scape)

Plateforme d'**apprentissage en ligne** : espace étudiant avec tableau de bord de
progression, cours, exercices, examens, notes et planning, ainsi qu'un espace enseignant.

## Fonctionnalités (routes)

| Route | Rôle |
|---|---|
| `/` | Tableau de bord : progression, reprise des cours, activité de la semaine, recommandations |
| `/courses`, `/learn/:courseId` | Catalogue et lecteur de cours |
| `/chat/:courseId` | Discussion liée à un cours |
| `/exercises`, `/exams` | Exercices et examens |
| `/notes`, `/schedule`, `/notifications` | Notes, emploi du temps, notifications |
| `/teacher` | Espace enseignant |
| `/login`, `/signup`, `/reset-password`, `/profile`, `/settings` | Compte utilisateur |

## Stack

TanStack Start (React 19, SSR), TanStack Router, Tailwind CSS 4, Radix UI / shadcn,
Recharts, Supabase (auth + base, migrations dans `supabase/`), déploiement Cloudflare
Workers (`wrangler.jsonc`). Généré initialement avec Lovable.

## Lancement

```bash
npm install
npm run dev
```
