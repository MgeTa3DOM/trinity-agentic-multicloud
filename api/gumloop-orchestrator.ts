/**
 * TRINITY GUMLOOP ORCHESTRATOR
 * Connecte Comet Pro + Gumloop + TrinitySkoolBot + Supabase
 * Système autonome 24/7 pour Avatarvers
 */

import { NextRequest, NextResponse } from 'next/server';
import { TrinitySkoolBot } from '../trinity-skool-automation';

interface GumloopWebhookPayload {
  event: 'schedule' | 'manual' | 'webhook';
  action: 'generate_content' | 'publish_post' | 'create_classroom' | 'moderate' | 'engage';
  data?: any;
}

interface TrinityAction {
  avatar: 'maitre-temps' | 'maitre-espace' | 'maitre-espace-temps' | 'meta-observer';
  task: string;
  priority: 'high' | 'medium' | 'low';
  scheduled_at?: string;
}

// Route API pour Gumloop Webhook
export async function POST(req: NextRequest) {
  try {
    const payload: GumloopWebhookPayload = await req.json();
    
    console.log('🔵 Trinity Orchestrator déclenché:', payload);

    // Vérifier l'authentification Gumloop
    const gumloopKey = req.headers.get('x-gumloop-key');
    if (gumloopKey !== process.env.GUMLOOP_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Router les actions selon le type
    let result;
    switch (payload.action) {
      case 'generate_content':
        result = await handleContentGeneration(payload.data);
        break;
      case 'publish_post':
        result = await handlePostPublication(payload.data);
        break;
      case 'create_classroom':
        result = await handleClassroomCreation(payload.data);
        break;
      case 'moderate':
        result = await handleModeration();
        break;
      case 'engage':
        result = await handleEngagement();
        break;
      default:
        result = { error: 'Action inconnue' };
    }

    // Sauvegarder dans Supabase
    await logToSupabase({
      action: payload.action,
      result,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      action: payload.action,
      result
    });

  } catch (error: any) {
    console.error('❌ Erreur Trinity Orchestrator:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET pour déclencher manuellement
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'moderate';
  
  console.log(`🎯 Déclenchement manuel: ${action}`);
  
  return POST(new NextRequest(req.url, {
    method: 'POST',
    headers: {
      'x-gumloop-key': process.env.GUMLOOP_WEBHOOK_SECRET!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event: 'manual',
      action
    })
  }));
}

// ======== HANDLERS ========

async function handleContentGeneration(data: any) {
  console.log('🤖 Génération de contenu IA...');
  
  // Appel à Perplexity/Comet via Gumloop
  const cometResponse = await callCometForContent(data.topic, data.avatar);
  
  return {
    generated: true,
    content: cometResponse,
    ready_for_publish: true
  };
}

async function handlePostPublication(data: any) {
  console.log('📝 Publication sur Avatarvers...');
  
  // Initialiser le bot Skool
  const bot = new TrinitySkoolBot();
  await bot.initialize();
  await bot.login(
    process.env.SKOOL_EMAIL!,
    process.env.SKOOL_PASSWORD!
  );
  
  // Publier le post
  const published = await bot.postToCommunity({
    id: data.id || `post-${Date.now()}`,
    title: data.title,
    content: data.content,
    avatar: data.avatar
  });
  
  await bot.cleanup();
  
  return {
    published,
    post_id: data.id,
    timestamp: new Date().toISOString()
  };
}

async function handleClassroomCreation(data: any) {
  console.log('🏫 Création Classroom...');
  
  const bot = new TrinitySkoolBot();
  await bot.initialize();
  await bot.login(
    process.env.SKOOL_EMAIL!,
    process.env.SKOOL_PASSWORD!
  );
  
  const created = await bot.createClassroom({
    id: data.id || `classroom-${Date.now()}`,
    title: data.title,
    description: data.description,
    lessons: data.lessons || []
  });
  
  await bot.cleanup();
  
  return {
    created,
    classroom_id: data.id
  };
}

async function handleModeration() {
  console.log('👮 Modération communauté...');
  
  const bot = new TrinitySkoolBot();
  await bot.initialize();
  await bot.login(
    process.env.SKOOL_EMAIL!,
    process.env.SKOOL_PASSWORD!
  );
  
  await bot.moderateCommunity();
  await bot.cleanup();
  
  return {
    moderated: true,
    timestamp: new Date().toISOString()
  };
}

async function handleEngagement() {
  console.log('👥 Engagement membres...');
  
  const bot = new TrinitySkoolBot();
  await bot.initialize();
  await bot.login(
    process.env.SKOOL_EMAIL!,
    process.env.SKOOL_PASSWORD!
  );
  
  await bot.engageWithMembers();
  await bot.cleanup();
  
  return {
    engaged: true,
    timestamp: new Date().toISOString()
  };
}

// ======== INTÉGRATIONS ========

async function callCometForContent(topic: string, avatar: string) {
  // Appeler Perplexity API (Comet)
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{
        role: 'system',
        content: `Tu es l'avatar ${avatar} du système Trinity Avatarvers. Génère un post Skool engageant et informatif sur: ${topic}. Style: expert mais accessible, avec emojis pertinents.`
      }]
    })
  });
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Parser titre et contenu
  const lines = content.split('\n');
  const title = lines[0].replace(/^[#*]+\s*/, '').substring(0, 100);
  
  return {
    title,
    content,
    avatar
  };
}

async function callGumloopWorkflow(action: string, data: any) {
  // Déclencher un workflow Gumloop
  const response = await fetch(
    `https://api.gumloop.com/api/v1/pipelines/${process.env.GUMLOOP_PIPELINE_ID}/run`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GUMLOOP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          action,
          data
        }
      })
    }
  );
  
  return await response.json();
}

async function logToSupabase(log: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/trinity_logs`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(log)
    }
  );
  
  if (!response.ok) {
    console.error('Erreur log Supabase:', await response.text());
  }
}

// ======== CRON SCHEDULER (appelé par Vercel Cron) ========

export async function scheduledTasks() {
  console.log('⏰ Tâches planifiées Trinity 24/7');
  
  const tasks: TrinityAction[] = [
    {
      avatar: 'meta-observer',
      task: 'moderate',
      priority: 'high'
    },
    {
      avatar: 'maitre-temps',
      task: 'engage',
      priority: 'medium'
    },
    {
      avatar: 'maitre-espace',
      task: 'generate_content',
      priority: 'low'
    }
  ];
  
  for (const task of tasks) {
    try {
      await POST(new NextRequest('http://localhost/api/gumloop-orchestrator', {
        method: 'POST',
        headers: {
          'x-gumloop-key': process.env.GUMLOOP_WEBHOOK_SECRET!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'schedule',
          action: task.task,
          data: { avatar: task.avatar }
        })
      }));
    } catch (error) {
      console.error(`❌ Erreur task ${task.task}:`, error);
    }
  }
}
