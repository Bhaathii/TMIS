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
