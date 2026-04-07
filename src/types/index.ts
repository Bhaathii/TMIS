export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: Date;
}

export interface TMISHeader {
  id: string;
  TMISIssueDate: Date;
  RevNo: number;
  Status: 'Active' | 'Obsolete';
  TapeCode: string;
  AdditionalInfo?: string;
  TMISComments?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TMISLayer {
  id: string;
  headerId: string;
  LayerNo: number;
  LayerDescription: string;
  WeightOrThickness?: string;
  ItemCode?: string;
  Note?: string;
}

export interface TMISProcess {
  id: string;
  headerId: string;
  ProcessLetter: 'A' | 'B' | 'C' | 'D';
  MachineType?: string;
  Heat?: number;
  Speed?: number;
  AFlow?: string;
  Press?: number;
  SetupTime?: string | number;
  ProcessingTime?: string | number;
  CleaningTime?: string | number;
  Other?: string;
  DescribeProcess?: string;
}

export interface TMISSlitting {
  id: string;
  headerId: string;
  RowNo: number;
  Processing?: string;
  ProcessingTime?: string | number;
  Cleaning?: string;
}

export interface LoginHistory {
  id: string;
  uid: string;
  email: string;
  loginTime: Date;
  ipAddress?: string;
  userAgent?: string;
}

export type ActivityType = 'login' | 'create' | 'edit' | 'delete' | 'view';

export interface ActivityLog {
  id: string;
  uid: string;
  email: string;
  action: ActivityType;
  resourceType: string; // 'TMIS_Header', 'TMIS_Layer', etc.
  resourceId?: string;
  description: string;
  timestamp: Date;
}

export type FTRType = 'Tape' | 'Seam Sealer' | 'Laser' | 'Strip Cutter' | 'Other';

export interface FTRData {
  id: string;
  ftrNumber: number;
  customerAccount: string;
  customerName: string;
  returnAddress: string;
  contactName: string;
  contactEmail: string;
  contactTel: string;
  ftrType: FTRType;
  fabricInfo: string;
  customerRequirements: string;
  results: {
    [key: string]: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
