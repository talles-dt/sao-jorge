/// ☩ São Jorge V2 — Zernio client for social media scheduling and messaging
// Reads ZERNIO_API_KEY from environment (process.env.ZERNIO_API_KEY or import.meta.env.ZERNIO_API_KEY)

import Zernio from '@zernio/node';

let zernioClient: Zernio | null = null;

export function getZernioClient(): Zernio {
  if (!zernioClient) {
    const apiKey = process.env.ZERNIO_API_KEY;
    if (!apiKey) {
      throw new Error('ZERNIO_API_KEY not found in environment');
    }
    zernioClient = new Zernio({ apiKey });
  }
  return zernioClient;
}

export async function listZernioAccounts() {
  const z = getZernioClient();
  const { data } = await z.accounts.listAccounts();
  return data;
}

export async function getZernioAccountHealth(accountId: string) {
  const z = getZernioClient();
  const { data } = await z.accounts.getAccountHealth({ params: { accountId } });
  return data;
}

export async function getAllZernioAccountsHealth() {
  const z = getZernioClient();
  const { data } = await z.accounts.getAllAccountsHealth();
  return data;
}

export async function createZernioPost({
  content,
  platforms,
  scheduledFor,
  publishNow = false,
}: {
  content: string;
  platforms: { platform: string; accountId: string }[];
  scheduledFor?: string;
  publishNow?: boolean;
}) {
  const z = getZernioClient();
  const { data } = await z.posts.createPost({
    body: {
      content,
      platforms,
      scheduledFor,
      publishNow,
    },
  });
  return data;
}

export async function listZernioPosts(params?: { status?: string; limit?: number; offset?: number }) {
  const z = getZernioClient();
  const { data } = await z.posts.listPosts({ query: params });
  return data;
}

export async function getZernioPost(postId: string) {
  const z = getZernioClient();
  const { data } = await z.posts.getPost({ params: { postId } });
  return data;
}

export async function updateZernioPost(postId: string, updates: { content?: string; scheduledFor?: string; status?: string }) {
  const z = getZernioClient();
  const { data } = await z.posts.updatePost({ params: { postId }, body: updates });
  return data;
}

export async function deleteZernioPost(postId: string) {
  const z = getZernioClient();
  const { data } = await z.posts.deletePost({ params: { postId } });
  return data;
}

export async function listZernioInboxConversations(params?: { platform?: string; accountId?: string; status?: string; limit?: number; offset?: number }) {
  const z = getZernioClient();
  const { data } = await z.messages.listInboxConversations({ query: params });
  return data;
}

export async function getZernioConversation(conversationId: string) {
  const z = getZernioClient();
  const { data } = await z.messages.getInboxConversation({ params: { conversationId } });
  return data;
}

export async function getZernioConversationMessages(conversationId: string, params?: { limit?: number; offset?: number }) {
  const z = getZernioClient();
  const { data } = await z.messages.getInboxConversationMessages({ params: { conversationId, ...params } });
  return data;
}

export async function sendZernioMessage(conversationId: string, content: string, mediaIds?: string[]) {
  const z = getZernioClient();
  const { data } = await z.messages.sendInboxMessage({
    params: { conversationId },
    body: { content, mediaIds },
  });
  return data;
}

export async function markZernioConversationRead(conversationId: string) {
  const z = getZernioClient();
  const { data } = await z.messages.markConversationRead({ params: { conversationId } });
  return data;
}

export async function getZernioAnalytics(params?: { platform?: string; accountId?: string; from?: string; to?: string }) {
  const z = getZernioClient();
  const { data } = await z.analytics.getAnalytics({ query: params });
  return data;
}

export async function getZernioDailyMetrics(params?: { from?: string; to?: string; platform?: string; accountId?: string }) {
  const z = getZernioClient();
  const { data } = await z.analytics.getDailyMetrics({ query: params });
  return data;
}

export async function getZernioBestTimeToPost(params?: { platform?: string; accountId?: string }) {
  const z = getZernioClient();
  const { data } = await z.analytics.getBestTimeToPost({ query: params });
  return data;
}

export async function getZernioFollowerStats(params?: { platform?: string; accountId?: string }) {
  const z = getZernioClient();
  const { data } = await z.accounts.getFollowerStats({ query: params });
  return data;
}

export async function getZernioMediaPresignedUrl(filename: string, mimeType: string, size: number) {
  const z = getZernioClient();
  const { data } = await z.media.getMediaPresignedUrl({ body: { filename, mimeType, size } });
  return data;
}

export async function listZernioQueueSlots(params?: { platform?: string; accountId?: string; limit?: number; offset?: number }) {
  const z = getZernioClient();
  const { data } = await z.queue.listQueueSlots({ query: params });
  return data;
}

export async function createZernioQueueSlot(data: { platform: string; accountId: string; dayOfWeek: number; time: string; timezone?: string }) {
  const z = getZernioClient();
  const { data: result } = await z.queue.createQueueSlot({ body: data });
  return result;
}

export async function listZernioProfiles() {
  const z = getZernioClient();
  const { data } = await z.profiles.listProfiles();
  return data;
}

export async function createZernioProfile(name: string, description?: string) {
  const z = getZernioClient();
  const { data } = await z.profiles.createProfile({ body: { name, description } });
  return data;
}

export async function listZernioWebhooks() {
  const z = getZernioClient();
  const { data } = await z.webhooks.getWebhookSettings();
  return data;
}

export async function createZernioWebhook(url: string, events: string[]) {
  const z = getZernioClient();
  const { data } = await z.webhooks.createWebhookSettings({ body: { url, events } });
  return data;
}

export async function getZernioUsage() {
  const z = getZernioClient();
  const { data } = await z.usage.getUsage();
  return data;
}

export async function getZernioBilling() {
  const z = getZernioClient();
  const { data } = await z.usage.getBilling();
  return data;
}

export async function validateZernioPostLength(content: string, platforms: string[]) {
  const z = getZernioClient();
  const { data } = await z.validate.validatePostLength({ body: { content, platforms } });
  return data;
}

export async function validateZernioPost(content: string, platforms: { platform: string; accountId: string }[]) {
  const z = getZernioClient();
  const { data } = await z.validate.validatePost({ body: { content, platforms } });
  return data;
}

export async function getZernioContentDecay(params?: { platform?: string; accountId?: string; from?: string; to?: string }) {
  const z = getZernioClient();
  const { data } = await z.analytics.getContentDecay({ query: params });
  return data;
}

export async function getZernioPostingFrequency(params?: { platform?: string; accountId?: string; from?: string; to?: string }) {
  const z = getZernioClient();
  const { data } = await z.analytics.getPostingFrequency({ query: params });
  return data;
}

export async function getZernioPostTimeline(params?: { platform?: string; accountId?: string; from?: string; to?: string }) {
  const z = getZernioClient();
  const { data } = await z.analytics.getPostTimeline({ query: params });
  return data;
}

export type { Zernio } from '@zernio/node';
export * from '@zernio/node';