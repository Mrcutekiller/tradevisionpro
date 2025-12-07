export enum PlanTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
  PRO = 'PRO'
}

export enum AccountType {
  STANDARD = 'Standard',
  RAW = 'Raw',
  PRO = 'Pro'
}

export interface UserSettings {
  accountSize: number;
  riskPercentage: number;
  accountType: AccountType;
}

export interface TradeLog {
  id: string;
  date: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  exit: number;
  pnl: number;
  status: 'WIN' | 'LOSS' | 'BE' | 'PENDING';
  timeframe?: string;
  reasoning?: string;
  sl?: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
  riskAmount?: number;
  lotSize?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  plan: PlanTier;
  signalsUsedLifetime: number;
  signalsUsedToday: number;
  joinDate: string;
  settings: UserSettings;
  idTheme: string;
  tradeHistory: TradeLog[];
}

export interface TradeSignal {
  id: string;
  timestamp: number;
  pair: string;
  timeframe: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number; // Added TP3
  slPips: number;
  tpPips: number;
  lotSize: number;
  riskAmount: number;
  rewardTp1: number;
  rewardTp2: number;
  rewardTp3: number; // Added Reward TP3
  reasoning: string;
  confidence: number; // 0-100
  strategy: string; // e.g. "ICT FVG Reversal"
  breakdown: string; // Step by step analysis
}

export interface AIAnalysisResponse {
  pair: string;
  timeframe: string;
  direction: string;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  // TP3 is calculated on frontend based on risk to ensure strict 1:3
  reasoning: string;
  isSetupValid: boolean;
  marketStructure: string[];
  confidence: number;
  strategy: string;
  breakdown: string;
}