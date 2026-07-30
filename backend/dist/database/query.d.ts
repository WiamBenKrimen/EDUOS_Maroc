import type { PoolClient, QueryResultRow } from 'pg';
export declare function query<T extends QueryResultRow>(text: string, values?: readonly unknown[]): Promise<T[]>;
export declare function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T>;
