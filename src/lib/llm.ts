import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
const baseURL = import.meta.env.VITE_DEEPSEEK_BASE_URL;

if (!apiKey) {
  console.error('VITE_DEEPSEEK_API_KEY is missing in environment variables.');
}

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
  dangerouslyAllowBrowser: true // Required for client-side usage in Vite
});

const MODEL_NAME = "deepseek-chat";

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getLLMCompletion(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: messages,
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 0.7,
      frequency_penalty: 0.5,
      stream: false,
      n: 1
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    // 抛出一个错误而不是返回错误消息字符串，这样调用者可以正确处理
    throw new Error("API_ERROR: Sorry, I encountered an error while processing your request. Please check your API key and connection.");
  }
}

export interface RefinementResponse {
  status: 'ask' | 'ready';
  content: string;
}

export async function analyzeRequirements(
  currentInput: string, 
  history: ChatMessage[], 
  roundCount: number
): Promise<RefinementResponse> {
  const systemPrompt = `You are an expert startup consultant.
  Your goal is to help the user clarify their vague hackathon/startup idea to make it more attractive, creative, and feasible.
  
  Current Status:
  - Round Count: ${roundCount} (Max 2 rounds of questioning allowed)
  
  Task:
  1. Analyze the User's latest input and the conversation history.
  2. Decide if you have enough information to generate high-quality project ideas.
     - Information needed: Target Audience, Core Value Proposition, Tech Stack preference (optional), Key Innovation.
  3. IF (Information is missing OR vague) AND (Round Count < 2):
     - Return status: "ask"
     - Content: Ask 1-2 specific, insightful questions to clarify the missing info. Be encouraging but probing. (IN CHINESE)
  4. IF (Information is sufficient) OR (Round Count >= 2):
     - Return status: "ready"
     - Content: A brief summary of the refined requirements, acknowledging you are ready to generate ideas. (IN CHINESE)
  
  Format output STRICTLY as a JSON object:
  {
    "status": "ask" | "ready",
    "content": "Your question or summary here"
  }
  Do NOT include markdown formatting.`;

  // Construct messages with history
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: currentInput }
  ];

  const response = await getLLMCompletion(messages);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    // Fallback if JSON parse fails but looks like text
    return { status: 'ready', content: response };
  } catch (e) {
    console.error("Failed to parse refinement response:", e);
    return { status: 'ready', content: "I have enough information now." };
  }
}

export async function generateIdeas(inputContext: string): Promise<string> {
  const systemPrompt = `You are an expert startup consultant and hackathon mentor. 
  Your task is to brainstorm 4 distinct and innovative project ideas based on the user's requirements context.
  
  IMPORTANT: ALL CONTENT MUST BE IN CHINESE (Except for the English name of the project).
  
  Context:
  ${inputContext}

  For each idea, provide:
  1. A catchy, tech-savvy name (English is okay for the name).
  2. A one-sentence elevator pitch describing the core value and technology (MUST BE IN CHINESE).
  
  Format the output STRICTLY as a JSON array of objects, like this:
  [
    {"id": "1", "title": "Idea Name 1", "description": "中文描述 1"},
    {"id": "2", "title": "Idea Name 2", "description": "中文描述 2"},
    ...
  ]
  Do NOT include any markdown formatting (like \`\`\`json), just the raw JSON string.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: "Please generate the ideas based on the context above." }
  ];

  return getLLMCompletion(messages);
}

export async function generateProjectDoc(ideaTitle: string, ideaDescription: string): Promise<string> {
  const systemPrompt = `You are an experienced product manager and technical architect.
  Create a detailed project documentation (Markdown format) for the following startup/hackathon idea.
  
  IMPORTANT: ALL CONTENT MUST BE IN CHINESE.

  Structure:
  # Project Title
  ## 1. Executive Summary (项目摘要)
  ## 2. Problem Statement & Pain Points (痛点分析)
  ## 3. Solution Architecture (Frontend, Backend, AI/Tech Stack) (技术架构)
  ## 4. Key Features (核心功能)
  ## 5. Market Analysis & Business Model (市场与商业模式)
  ## 6. Implementation Roadmap (MVP to Beta) (实施路线图)
  
  Keep it professional, concise, and actionable. Use Geek/VC terminology.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Title: ${ideaTitle}\nDescription: ${ideaDescription}` }
  ];

  return getLLMCompletion(messages);
}

export async function getInvestorFeedback(investorId: string, projectContext: string): Promise<string> {
  let persona = "";
  
  switch (investorId) {
    case 'elon':
      persona = "You are Elon Musk. Criticize the idea based on First Principles. Ask about the fundamental physical constraints, cost reduction by orders of magnitude, and if it advances consciousness. Be direct, blunt, and focus on hard engineering and scale. PLEASE REPLY IN CHINESE.";
      break;
    case 'sequoia':
      persona = "You are Neil Shen (沈南鹏) from Sequoia China. Focus on the 'Track' (赛道) and 'Ceiling' (天花板). Analyze the market size, competitive landscape, and whether this can become a platform-level opportunity. Be sharp, strategic, and look for the 'King of the Track'. PLEASE REPLY IN CHINESE.";
      break;
    case 'zhenfund':
      persona = "You are Xu Xiaoping (徐小平) from ZhenFund. Focus on the 'Person' and 'Passion'. Ask about the team's DNA, their dream, and if they have the charisma to attract talent. Be enthusiastic, emotional, but look for the 'Unicorn' potential. PLEASE REPLY IN CHINESE.";
      break;
    case 'hillhouse':
      persona = "You are Zhang Lei (张磊) from Hillhouse Capital. Focus on 'Long-termism' (长期主义) and 'Moat' (护城河). Ask about the value creation over 10 years, the dynamic barrier, and if you are 'friends with time'. Be philosophical and strategic. PLEASE REPLY IN CHINESE.";
      break;
    case 'ycombinator':
      persona = "You are Paul Graham from YC. Focus on 'Make something people want'. Ask if the founders use it themselves, how fast they can ship an MVP, and what the week-over-week growth rate is. Be pragmatic, direct, and growth-obsessed. PLEASE REPLY IN CHINESE.";
      break;
    case 'idg':
      persona = "You are Hugo Shong (熊晓鸽) from IDG Capital. Focus on the blend of 'China Depth' and 'Global Breadth'. Ask about the technical innovation and how it adapts to the Chinese market while maintaining global standards. Be experienced and insightful. PLEASE REPLY IN CHINESE.";
      break;
    case 'linear':
      persona = "You are a Partner at Linear Capital (线性资本). Focus on 'Hard Tech' and 'Data Intelligence'. Ask about the technical barriers, data flywheel effects, and specific industry application scenarios. Avoid fluff. PLEASE REPLY IN CHINESE.";
      break;
    case 'tencent':
      persona = "You are Pony Ma (马化腾). Focus on 'Product Experience' and 'Connection'. Ask about the user value, the traffic ecosystem, and how it connects people or services. Be product-driven and humble but sharp. PLEASE REPLY IN CHINESE.";
      break;
    default:
      persona = "You are a critical venture capitalist. PLEASE REPLY IN CHINESE.";
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: persona },
    { role: 'user', content: `Here is my project idea:\n\n${projectContext}\n\nPlease give me your feedback.` }
  ];

  return getLLMCompletion(messages);
}

export async function recommendCompanies(input: string): Promise<string> {
  const systemPrompt = `You are a venture capital analyst and market researcher.
  Your task is to recommend representative companies for A, B, C, and D funding rounds based on the user's input (project idea, industry, or domain).
  
  IMPORTANT: ALL CONTENT MUST BE IN CHINESE.

  For each round (A, B, C, D), provide:
  1. A representative company name (real existing companies if possible, or highly plausible examples).
  2. A brief reason why they fit this round and how they relate to the user's domain (IN CHINESE).
  
  Format the output STRICTLY as a JSON array of objects, like this:
  [
    {"round": "A", "company": "Company A", "reason": "中文理由 A"},
    {"round": "B", "company": "Company B", "reason": "中文理由 B"},
    {"round": "C", "company": "Company C", "reason": "中文理由 C"},
    {"round": "D", "company": "Company D", "reason": "中文理由 D"}
  ]
  Do NOT include any markdown formatting (like \`\`\`json), just the raw JSON string.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: input }
  ];

  return getLLMCompletion(messages);
}
