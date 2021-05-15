declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ENV: string;
            PORT: number;

            VERSION: string;
            TITLE: string;
            DESCRIPTION: string;
        }
    }
}

export {};
