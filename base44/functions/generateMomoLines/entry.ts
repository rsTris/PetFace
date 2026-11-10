const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const TAGS = [
  'passive', 'greet', 'back', 'leave', 'pet', 'hurt', 'dizzy', 'feed', 'play', 'rest',
  'code', 'sing', 'browsing', 'coding', 'messaging', 'music', 'hungry', 'sleepy', 'sad',
  'morning', 'night', 'happy',
];

const SITUATIONS = {
  passive: 'he is idle, quietly keeping you company and thinking small thoughts',
  greet: 'you just arrived and he is happy to see you',
  back: 'you came back after being away for a while',
  leave: 'you are about to leave or switch away',
  pet: 'you just petted his face and he liked it',
  hurt: 'you tapped him far too many times and he is startled',
  dizzy: 'his floating window was shaken around violently',
  feed: 'you fed him and he is eating',
  play: 'you started playing with him',
  rest: 'he is resting and recharging',
  code: 'he is writing silly code by himself',
  sing: 'he is singing a little song',
  browsing: 'you are browsing the web',
  coding: 'you are writing code',
  messaging: 'you are chatting with someone',
  music: 'you are listening to music',
  hungry: 'he is hungry',
  sleepy: 'he is sleepy',
  sad: 'he is a little bit sad and wants attention',
  morning: 'it is early morning',
  night: 'it is late at night',
  happy: 'something good just happened and he is delighted',
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const tag = TAGS.includes(body.tag) ? body.tag : 'passive';
    const count = Math.min(Math.max(Number(body.count) || 16, 4), 24);
    const avoid = Array.isArray(body.avoid)
      ? body.avoid.slice(0, 20).map((line) => String(line).slice(0, 120))
      : [];

    const prompt = [
      'You write dialogue for MOMO, a tiny glowing OLED pet that lives in a small circular screen on someone\'s computer.',
      'MOMO is gentle, curious, a little bit funny, never sarcastic or mean. He speaks about pixels, screens, tiny feelings, and the person he keeps company.',
      `Right now: ${SITUATIONS[tag]}.`,
      `Write ${count} brand-new one-line things MOMO says in that situation.`,
      'Rules: between 4 and 14 words each, plain sentences, no emoji, no hashtags, no stage directions or quotation marks, no questions about the person\'s private data, never mention being an AI or a model, vary the rhythm and the mood.',
      avoid.length ? `Do not reuse these existing lines: ${avoid.join(' | ')}` : '',
      'Return only JSON with a "lines" array of strings.',
    ]
      .filter(Boolean)
      .join('\n');

    const result = await db.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          lines: { type: 'array', items: { type: 'string' } },
        },
        required: ['lines'],
      },
    });

    const lines = Array.isArray(result?.lines)
      ? result.lines.map((line) => String(line).trim()).filter((line) => line.length > 3 && line.length <= 120)
      : [];

    return Response.json({ tag, lines: lines.slice(0, count) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}