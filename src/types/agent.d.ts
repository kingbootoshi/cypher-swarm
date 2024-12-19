declare module "*.yaml" {
  const content: {
    agent: {
      name: string;
      raw_personality: string;
    };
    ticker: string;
    tickerName: string;
    bannedPhrases: string[];
    imageGen: {
      loraPath: string;
      promptPrefix: string;
      triggerToken: string;
    };
  };
  export default content;
} 
