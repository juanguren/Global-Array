export type valueType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface CacheTypeDTO {
    key: string;
    value: valueType
}