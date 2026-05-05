import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: process.env.DGRID_BASE_URL || 'https://api.dgrid.ai/v1',
  apiKey: process.env.DGRID_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://agentpay.xyz',
    'X-Title': 'AgentPay',
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, taskType, description, budget, amount, condition, recipient } = body;

    if (action === 'plan') {
      const response = await client.chat.completions.create({
        model: 'anthropic/claude-3-haiku',
        messages: [{
          role: 'user',
          content: `You are AgentPay's AI planner on Solana blockchain.
Create a clear execution plan for this agent:
- Task Type: ${taskType}
- Description: ${description}
- Budget: $${budget} CASH stablecoin
- Amount per execution: $${amount}
- Condition/Trigger: ${condition || 'on demand'}
- Recipient: ${recipient || 'TBD'}

Write a friendly 4-5 step plan explaining exactly what the agent will do. Be specific and concise.`
        }],
        max_tokens: 400,
      });

      return NextResponse.json({
        plan: response.choices[0]?.message?.content || 'Agent plan ready.',
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json({
      plan: 'Agent configured and ready to deploy on Solana devnet.',
    });
  }
}