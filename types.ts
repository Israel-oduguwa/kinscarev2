// types.ts
export interface Thread {
    id: string;
    title: string;
    replies: number;
    views: number;
  }
  
  export interface Post {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }