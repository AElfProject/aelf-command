export const callCommandUsages: string[];
export const callCommandParameters: ({
    type: string;
    name: string;
    extraName: string[];
    message: string;
    suffix: string;
    pageSize?: undefined;
    choices?: undefined;
    filter?: undefined;
} | {
    type: string;
    name: string;
    message: string;
    pageSize: number;
    choices: never[];
    suffix: string;
    extraName?: undefined;
    filter?: undefined;
} | {
    type: string;
    name: string;
    message: string;
    suffix: string;
    filter: (val?: string) => string;
    extraName?: undefined;
    pageSize?: undefined;
    choices?: undefined;
})[];
export namespace commonGlobalOptionValidatorDesc {
    namespace password {
        let type: string;
        let required: boolean;
        let message: string;
        function validator(rule: any, value: any): boolean;
    }
    namespace endpoint {
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
        export let pattern: RegExp;
        let message_1: string;
        export { message_1 as message };
    }
    namespace datadir {
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
        let message_2: string;
        export { message_2 as message };
    }
    namespace account {
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
        let message_3: string;
        export { message_3 as message };
    }
}
export const strictGlobalOptionValidatorDesc: {};
export const blkInfoCommandParameters: ({
    type: string;
    name: string;
    extraName: string[];
    message: string;
    suffix: string;
    required?: undefined;
    initial?: undefined;
    active?: undefined;
    inactive?: undefined;
} | {
    type: string;
    name: string;
    required: boolean;
    initial: boolean;
    message: string;
    active: string;
    inactive: string;
    suffix: string;
    extraName?: undefined;
})[];
export const blkInfoCommandUsage: string[];
export const txResultCommandParameters: {
    type: string;
    name: string;
    message: string;
    suffix: string;
}[];
export const txResultCommandUsage: string[];
/**
 * specified the prompts options for CLI global options
 * @type {*[]}
 */
export const globalOptionsPrompts: any[];
export const createCommandParameters: {
    type: string;
    name: string;
    required: boolean;
    initial: boolean;
    default: boolean;
    message: string;
    active: string;
    inactive: string;
}[];
export const createCommandUsage: string[];
export const loadCommandParameters: ({
    type: string;
    name: string;
    extraName: string[];
    message: string;
    suffix: string;
    required?: undefined;
    default?: undefined;
    initial?: undefined;
    active?: undefined;
    inactive?: undefined;
    when?: undefined;
} | {
    type: string;
    message: string;
    name: string;
    required: boolean;
    default: boolean;
    initial: boolean;
    active: string;
    inactive: string;
    suffix: string;
    when(answers: any): boolean;
    extraName?: undefined;
} | {
    type: string;
    name: string;
    required: boolean;
    default: boolean;
    initial: boolean;
    message: string;
    active: string;
    inactive: string;
    suffix: string;
    extraName?: undefined;
    when?: undefined;
})[];
export const loadCommandUsage: string[];
export const passwordPrompts: ({
    type: string;
    name: string;
    mask: string;
    message: string;
    validate(val: any): boolean;
    suffix: string;
} | {
    type: string;
    name: string;
    mask: string;
    message: string;
    suffix: string;
    validate?: undefined;
})[];
export const deployCommandUsage: string[];
export const deployCommandParameters: ({
    type: string;
    name: string;
    message: string;
    suffix: string;
    filter?: undefined;
} | {
    type: string;
    name: string;
    message: string;
    filter(val: any): any;
    suffix: string;
})[];
export const configCommandParameters: {
    type: string;
    name: string;
    required: boolean;
    message: string;
    suffix: string;
}[];
export const configCommandUsage: string[];
export const proposalCommandParameters: ({
    type: string;
    name: string;
    message: string;
    choices: string[];
    suffix: string;
    format?: undefined;
    initial?: undefined;
} | {
    type: string;
    name: string;
    message: string;
    suffix: string;
    choices?: undefined;
    format?: undefined;
    initial?: undefined;
} | {
    type: string;
    name: string;
    message: string;
    format: string[];
    initial: any;
    suffix: string;
    choices?: undefined;
})[];
export const proposalCommandUsage: string[];
export const eventCommandParameters: {
    type: string;
    name: string;
    message: string;
    suffix: string;
}[];
export const eventCommandUsage: string[];
