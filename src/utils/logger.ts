// src/utils/logger.ts

export class Logger {
    private static enabled = false;
  
    static enable() {
      this.enabled = true;
    }
  
    static disable() {
      this.enabled = false;
    }
  
    static log(...args: any[]) {
      if (this.enabled) {
        console.log(...args);
      }
    }
  }