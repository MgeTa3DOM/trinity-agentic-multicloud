# TRINITY AVATARVERS - GUIDE DE DÉPLOIEMENT

## 🎯 Système Autonome 24/7 Comet + Gumloop + TrinityBot + Supabase

### Architecture du Système

```
┌─────────────────────────────────────────────────────────────┐
│                    TRINITY ORCHESTRATOR                      │
│                    (Système Autonome 24/7)                   │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐        ┌──────▼──────┐      ┌─────▼─────┐
    │  COMET  │        │   GUMLOOP   │      │ SUPABASE  │
    │  PRO    │◄───────┤ ORCHESTRATOR   │◄───┤ DATABASE │
    │ GenAI  │        └─────────────┘      └───────────┘
    └─────────┘              │
                        ┌───────▼────────┐
                        │  SKOOL AVATARVERS │
                        │ (TrinitySkoolBot)│
                        └─────────────────┘
```

## 🚀 ÉTAPES DE DÉPLOIEMENT

### 1. Configuration Supabase

```bash
# Tables à créer dans Supabase:
- trinity_logs (action, result, timestamp)
- skool_posts (post_id, title, content, avatar, published_at)
- skool_classrooms (classroom_id, title, lessons_count, created_at)
- skool_stats (members_count, timestamp)
```

### 2. Variables d'environnement Vercel

Configurer dans Vercel Dashboard:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yynxclwyiitdigxlxeba.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ta clé anon]
SUPABASE_SERVICE_ROLE_KEY=[ta clé service_role]

# Gumloop
GUMLOOP_API_KEY=[ta clé API]
GUMLOOP_PIPELINE_ID=utTpYxRKadzUnoCFkbxUiJ
GUMLOOP_WEBHOOK_SECRET=[générer un secret fort]

# Perplexity (Comet)
PERPLEXITY_API_KEY=[ta clé API Perplexity]

# Skool
SKOOL_EMAIL=[ton email Skool]
SKOOL_PASSWORD=[ton password Skool]
```

### 3. Déployer sur Vercel

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer

### 4. Configurer Gumloop Webhooks

Dans Gumloop Trinity Orchestrator:
1. Ajouter un node "Webhook"
2. URL: `https://ton-domaine.vercel.app/api/gumloop-orchestrator`
3. Header: `x-gumloop-key: [ton_secret]`
4. Activer "1 Trigger On"

## 🔄 FLUX AUTONOME 24/7

### Cron Jobs Configurés

- **Modération**: Toutes les 2h (`0 */2 * * *`)
- **Engagement**: Toutes les 4h (`0 */4 * * *`)
- **Publication**: 3x/jour à 9h, 15h, 21h (`0 9,15,21 * * *`)
- **Classroom**: Chaque lundi 10h (`0 10 * * 1`)

### Flux de Données

1. **Vercel Cron** déclenche `/api/cron/*`
2. **Cron** appelle `/api/gumloop-orchestrator`
3. **Orchestrator** exécute:
   - Génère contenu via Comet/Perplexity
   - Appelle TrinitySkoolBot
   - Publie sur Avatarvers
   - Log dans Supabase
4. **Gumloop** analyse logs Supabase via Trinity Orchestrator
5. **Avatars Trinity** donnent feedback et optimisations

## 🎯 ACTIONS DISPONIBLES

### Via API

```bash
# Modération manuelle
curl https://ton-domaine.vercel.app/api/gumloop-orchestrator?action=moderate

# Générer contenu
curl -X POST https://ton-domaine.vercel.app/api/gumloop-orchestrator \
  -H "x-gumloop-key: SECRET" \
  -d '{"action":"generate_content","data":{"topic":"IA Agents 2025"}}'

# Publier post
curl -X POST https://ton-domaine.vercel.app/api/gumloop-orchestrator \
  -H "x-gumloop-key: SECRET" \
  -d '{"action":"publish_post","data":{"title":"...","content":"..."}}'
```

## ✅ VÉRIFICATION

1. Check logs Vercel: `vercel logs --follow`
2. Check Supabase `trinity_logs` table
3. Vérifier posts sur Avatarvers
4. Monitor Gumloop runs

## 🔧 MAINTENANCE

- **Logs**: Vercel Dashboard > Logs
- **Crons**: Vercel Dashboard > Cron Jobs
- **Database**: Supabase Dashboard
- **Workflow**: Gumloop Dashboard

---

🎉 **Système maintenant AUTONOME 24/7!**

Le Trinity Orchestrator connecte Comet Pro, Gumloop, TrinitySkoolBot et Supabase pour gérer automatiquement la communauté Avatarvers sans intervention manuelle.
