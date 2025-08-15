import { Thread, Post, PaginatedResponse } from '../../types';
const BaseUrl = "https://kinscare-backend.onrender.com/api/v1"
export async function getThreads(page: number, limit: number): Promise<PaginatedResponse<Thread>> {
  const res = await fetch(`${BaseUrl}/threads?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch threads');
  return res.json();
}

export async function getThreadById(id: string): Promise<Thread | null> {
  const res = await fetch(`${BaseUrl}/threads/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch thread');
  }
  return res.json();
}

export async function getPosts(threadId: string, page: number, limit: number): Promise<PaginatedResponse<Post>> {
  const res = await fetch(`${BaseUrl}/threads/${threadId}/posts?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

