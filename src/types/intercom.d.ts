interface Window {
    intercomSettings: {
      app_id: string;
      [key: string]: any;
    };
    Intercom: {
      (command: string, ...params: any[]): void;
      booted: boolean;
    };
  }