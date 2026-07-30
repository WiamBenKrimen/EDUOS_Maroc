export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    HOST: string;
    PORT: number;
    DATABASE_URL: string;
    DATABASE_SSL: boolean;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CORS_ORIGIN: string;
    LOG_LEVEL: "error" | "fatal" | "warn" | "info" | "debug" | "trace" | "silent";
};
