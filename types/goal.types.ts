export interface Goal {
  _id: string;
  title: string;
  description?: string;
  category:
    | "Performance"
    | "Risk Management"
    | "Discipline"
    | "Psychology"
    | "Consistency"
    | "Journaling"
    | "Custom";
  targetType: "Percentage" | "Currency" | "Count" | "Boolean";
  targetValue: number;
  currentValue: number;
  unit?: string;
  priority: "Low" | "Medium" | "High";
  status: "Active" | "Completed" | "Failed" | "Archived";
  startsAt: string;
  endsAt: string;
  notes?: string;
  tradingAccount?:
    | string
    | {
        _id: string;
        accountName: string;
        broker: string;
        currency?: string;
      };
}

export type CreateGoalPayload = {
  tradingAccount: string;
  title: string;
  description?: string;
  category?: Goal["category"];
  targetType: Goal["targetType"];
  targetValue: number;
  currentValue?: number;
  unit?: string;
  priority?: Goal["priority"];
  startsAt?: string;
  endsAt?: string;
  notes?: string;
};
