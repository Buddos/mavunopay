export interface FarmerRecord {
  id: string;
  phone: string;
  name?: string | null;
  nationalId?: string | null;
  createdAt: string;
  stellarPublicKey: string;
  allocationRules: Array<{ key: string; pct: number }>;
  creditScore?: number;
  creditTier?: string;
  coopId?: string | null;
  coopRole?: string;
}

export interface GoalRecord {
  id: string;
  farmerId: string;
  name: string;
  description?: string | null;
  targetAmount: number;
  balance: number;
  currency?: string;
  targetDate?: string | null;
  locked?: boolean;
  unlockDate?: string | null;
  createdAt: string;
}

export interface TransactionRecord {
  id: string | number;
  farmerId: string;
  amount: number;
  memo?: string | null;
  assetCode?: string | null;
  assetIssuer?: string | null;
  groupPayment?: boolean;
  allocations?: Array<{ key: string; pct: number; amount: number }>;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  farmerId: string;
  goalId?: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'standard' | 'emergency';
  memo?: string | null;
  requestedAt: string;
  processedAt?: string | null;
}

export interface LoanRecord {
  id: string;
  farmerId: string;
  amount: number;
  currency: string;
  termMonths: number;
  status: 'pending' | 'approved' | 'rejected' | 'repaid';
  requestedAt: string;
  approvedAt?: string | null;
  dueDate?: string | null;
  repaidAmount?: number;
}
