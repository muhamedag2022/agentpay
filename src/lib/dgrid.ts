import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: process.env.DGRID_BASE_URL || 'https://api.dgrid.ai/v1',
  apiKey: process.env.DGRID_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://agentpay.xyz',
    'X-Title': 'AgentPay',
  },
});

export interface AgentInstruction {
  taskType: string;
  description: string;
  budget: number;
  condition?: string;
  amount?: number;
  recipient?: string;
}

export async function generateAgentPlan(instruction: AgentInstruction): Promise<string> {
  const prompt = `You are an AI agent manager for AgentPay on Solana blockchain.
  
User wants to create an agent with these specs:
- Task: ${instruction.taskType}
- Description: ${instruction.description}
- Budget: $${instruction.budget} CASH
- Condition: ${instruction.condition || 'immediate'}
- Amount per execution: $${instruction.amount || 0}
- Recipient: ${instruction.recipient || 'N/A'}

Respond with a clear, concise execution plan in 3-5 steps. Be specific about what the agent will do, when, and how much it will spend. Keep it user-friendly.`;

  const response = await client.chat.completions.create({
    model: 'anthropic/claude-3-5-sonnet',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || 'Plan generated successfully.';
}

export async function analyzeAgentTask(
  taskDescription: string,
  logs: string[]
): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'anthropic/claude-3-5-sonnet',
    messages: [
      {
        role: 'user',
        content: `Analyze this agent task and recent logs, provide a brief status report:
Task: ${taskDescription}
Recent logs: ${logs.slice(-5).join('\n')}
Keep response under 100 words.`,
      },
    ],
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content || 'Agent operating normally.';
}