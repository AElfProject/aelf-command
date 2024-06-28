export const callCommandUsages: string[];
export interface CallCommandParameter {
  type: string;
  name: string;
  message: string;
  pageSize?: number;
  choices?: string[];
  suffix: string;
  extraName?: string;
  filter?: (input: any) => string;
}
export const callCommandParameters: CallCommandParameter[];

export interface PasswordValidatorDesc {
  type: string;
  required: boolean;
  message: string;
  validator(rule: any, value: any): boolean;
}

export interface EndpointValidatorDesc {
  type: string;
  required: boolean;
  regex: RegExp;
  message: string;
}

export interface DatadirValidatorDesc {
  type: string;
  required: boolean;
  message: string;
}

export interface AccountValidatorDesc {
  type: string;
  required: boolean;
  message: string;
}
export interface CommonGlobalOptionValidatorDesc {
  password: PasswordValidatorDesc;
  endpoint: EndpointValidatorDesc;
  datadir: DatadirValidatorDesc;
  account: AccountValidatorDesc;
}
export const commonGlobalOptionValidatorDesc: CommonGlobalOptionValidatorDesc;

export const strictGlobalOptionValidatorDesc: CommonGlobalOptionValidatorDesc;

export interface BlkInfoCommandParameter {
  type: 'input' | 'confirm';
  name: string;
  extraName?: string[];
  message: string;
  suffix: string;
  required?: boolean;
  initial?: boolean;
  active?: string;
  inactive?: string;
}
export const blkInfoCommandParameters: BlkInfoCommandParameter[];
export const blkInfoCommandUsage: string[];

export interface TxResultCommandParameter {
  type: 'input';
  name: string;
  message: string;
  suffix: string;
}
export const txResultCommandParameters: TxResultCommandParameter[];
export const txResultCommandUsage: string[];

export interface GlobalOptionPrompt {
  type: 'input' | 'password';
  name: string;
  message: string;
  suffix: string;
  mask?: string;
}
export const globalOptionsPrompts: GlobalOptionPrompt[];

export interface CreateCommandParameter {
  type: 'confirm';
  name: string;
  required?: boolean;
  initial?: boolean;
  default?: boolean;
  message: string;
  active: string;
  inactive: string;
}
export const createCommandParameters: CreateCommandParameter[];
export const createCommandUsage: string[];

export interface LoadCommandParameter {
  type: 'input' | 'confirm';
  name: string;
  required?: boolean;
  initial?: boolean;
  default?: boolean;
  message: string;
  active?: string;
  inactive?: string;
  suffix: string;
  extraName?: string[];
  when?(answers: Record<string, any>): boolean;
}
export const loadCommandParameters: LoadCommandParameter[];
export const loadCommandUsage: string[];

export interface PasswordPrompt {
  type: 'password';
  name: string;
  mask: string;
  message: string;
  validate?(val: string): boolean | string | Promise<boolean | string>;
  suffix: string;
}
export const passwordPrompts: PasswordPrompt[];
export const deployCommandUsage: string[];

export interface DeployCommandParameter {
  type: 'input';
  name: string;
  message: string;
  suffix: string;
  filter?(val: any): any;
}
export const deployCommandParameters: DeployCommandParameter[];

export interface ConfigCommandParameter {
  type: 'input';
  name: string;
  required?: boolean;
  message: string;
  suffix: string;
}
export const configCommandParameters: ConfigCommandParameter[];
export const configCommandUsage: string[];

export interface ProposalCommandParameter {
  type: 'list' | 'input' | 'date';
  name: string;
  message: string;
  suffix: string;
  choices?: string[];
  format?: string[];
  initial?: Date | string | (() => Date | string);
}
export const proposalCommandParameters: ProposalCommandParameter[];
export const proposalCommandUsage: string[];

export interface EventCommandParameter {
  type: 'input';
  name: string;
  message: string;
  suffix: string;
}
export const eventCommandParameters: EventCommandParameter[];
export const eventCommandUsage: string[];
