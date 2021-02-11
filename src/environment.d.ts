declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VERSION : string;
      TITLE : string;
      DESCRIPTION : string;
      ENV : string;
    }
  }
}

export {};
