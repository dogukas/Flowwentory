export type PlanType = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  maxSKU: number;
  maxUsers: number;
  features: {
    advancedAnalytics: boolean;
    excelExport: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxSKU: 500,
    maxUsers: 1,
    features: {
      advancedAnalytics: false,
      excelExport: false,
      apiAccess: false,
      prioritySupport: false,
    }
  },
  pro: {
    maxSKU: 10000,
    maxUsers: 5,
    features: {
      advancedAnalytics: true,
      excelExport: true,
      apiAccess: false,
      prioritySupport: true,
    }
  },
  enterprise: {
    maxSKU: Infinity,
    maxUsers: Infinity,
    features: {
      advancedAnalytics: true,
      excelExport: true,
      apiAccess: true,
      prioritySupport: true,
    }
  }
};

export function checkLimit(currentPlan: PlanType, metric: 'sku' | 'users', currentValue: number): boolean {
  const limits = PLAN_LIMITS[currentPlan];
  if (metric === 'sku') return currentValue < limits.maxSKU;
  if (metric === 'users') return currentValue < limits.maxUsers;
  return false;
}
