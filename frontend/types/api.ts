export interface HealthData {
  status: string;
  project: string;
  version: string;
  environment: string;
  database: {
    status: string;
    dialect?: string;
    database_url_type?: string;
    healthy: boolean;
    error?: string;
  };
  ai_engine: {
    status: string;
    mode: string;
    demo_ai_mode: boolean;
    provider: string;
    capabilities: string[];
  };
  timestamp: string;
}

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
