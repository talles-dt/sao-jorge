"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://sao-jorge-api.talles-f1e.workers.dev";

interface ZernioAccount {
  id: string;
  platform: string;
  username: string;
  profileId: string;
  profileName: string;
  isHealthy: boolean;
  lastSync: string | null;
}

interface ZernioPost {
  _id: string;
  content: string;
  platforms: { platform: string; accountId: string; status: string }[];
  status: string;
  scheduledFor: string | null;
  createdAt: string;
  publishedAt: string | null;
}

interface ZernioAnalytics {
  overview?: {
    totalPosts: number;
    totalEngagement: number;
    totalReach: number;
    totalFollowers: number;
  };
  byPlatform?: Record<string, {
    posts: number;
    engagement: number;
    reach: number;
    followers: number;
  }>;
}

interface InboxConversation {
  _id: string;
  platform: string;
  accountId: string;
  contactName: string;
  contactHandle: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: string;
}

export default function ZernioAdminPage() {
  const [activeTab, setActiveTab] = useState<"accounts" | "posts" | "analytics" | "inbox" | "create">("accounts");
  const [accounts, setAccounts] = useState<ZernioAccount[]>([]);
  const [posts, setPosts] = useState<ZernioPost[]>([]);
  const [analytics, setAnalytics] = useState<ZernioAnalytics | null>(null);
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create post form state
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostPlatforms, setNewPostPlatforms] = useState<{ platform: string; accountId: string }[]>([]);
  const [newPostScheduledFor, setNewPostScheduledFor] = useState("");
  const [newPostPublishNow, setNewPostPublishNow] = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/zernio/accounts`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const data = await res.json();
      setAccounts(data.accounts || data);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/zernio/posts`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data.posts || data);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/zernio/analytics`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const fetchInbox = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/zernio/inbox`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch inbox");
      const data = await res.json();
      setConversations(data.conversations || data);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const platforms = selectedAccountIds.map((accountId) => {
        const account = accounts.find((a) => a.id === accountId);
        return { platform: account?.platform || "twitter", accountId };
      });

      const res = await fetch(`${API_BASE}/api/admin/zernio/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          content: newPostContent,
          platforms,
          scheduledFor: newPostScheduledFor || undefined,
          publishNow: newPostPublishNow,
        }),
      });

      if (!res.ok) throw new Error("Failed to create post");
      setSuccess("Post created successfully!");
      setNewPostContent("");
      setSelectedAccountIds([]);
      setNewPostScheduledFor("");
      setNewPostPublishNow(false);
      fetchPosts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getAdminToken = () => {
    // In a real app, this would come from auth context
    return localStorage.getItem("admin_token") || "";
  };

  useEffect(() => {
    if (activeTab === "accounts") fetchAccounts();
    else if (activeTab === "posts") fetchPosts();
    else if (activeTab === "analytics") fetchAnalytics();
    else if (activeTab === "inbox") fetchInbox();
  }, [activeTab]);

  const tabs = [
    { id: "accounts", label: "Contas", icon: "👥" },
    { id: "posts", label: "Posts", icon: "📝" },
    { id: "create", label: "Criar Post", icon: "➕" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "inbox", label: "Inbox", icon: "💬" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">☩ Zernio Admin</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Contas Conectadas</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma conta conectada. Configure no dashboard do Zernio.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 rounded-lg border ${account.isHealthy ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold capitalize">{account.platform}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${account.isHealthy ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {account.isHealthy ? "Conectada" : "Erro"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">@{account.username}</p>
                  <p className="text-xs text-gray-500 mt-1">Perfil: {account.profileName}</p>
                  <p className="text-xs text-gray-500">Última sincronização: {account.lastSync ? new Date(account.lastSync).toLocaleString("pt-BR") : "Nunca"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Posts Agendados / Publicados</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum post encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conteúdo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plataformas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agendado para</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{post.content}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {post.platforms.map((p) => (
                          <span key={p.accountId} className="inline-block mr-1 px-2 py-0.5 text-xs bg-gray-100 rounded">
                            {p.platform}: {p.status}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          post.status === "published" ? "bg-green-100 text-green-700" :
                          post.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                          post.status === "draft" ? "bg-gray-100 text-gray-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {post.scheduledFor ? new Date(post.scheduledFor).toLocaleString("pt-BR") : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(post.createdAt).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Post Tab */}
      {activeTab === "create" && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold mb-6">Criar Novo Post</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Escreva seu post aqui..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plataformas / Contas</label>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <label key={account.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAccountIds.includes(account.id)}
                      onChange={(e) => setSelectedAccountIds(
                        e.target.checked
                          ? [...selectedAccountIds, account.id]
                          : selectedAccountIds.filter((id) => id !== account.id)
                      )}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{account.platform} - @{account.username}</span>
                    <span className="text-xs text-gray-500">({account.profileName})</span>
                  </label>
                ))}
                {accounts.length === 0 && <p className="text-sm text-gray-500">Nenhuma conta disponível. Configure no dashboard do Zernio.</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agendar para</label>
                <input
                  type="datetime-local"
                  value={newPostScheduledFor}
                  onChange={(e) => setNewPostScheduledFor(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPostPublishNow}
                    onChange={(e) => setNewPostPublishNow(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">Publicar agora</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPostContent.trim() || selectedAccountIds.length === 0}
              className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Publicando..." : "Publicar Post"}
            </button>
          </form>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Analytics</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : analytics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Total de Posts</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview?.totalPosts || 0}</p>
              </div>
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Engajamento Total</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview?.totalEngagement || 0}</p>
              </div>
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Alcance Total</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview?.totalReach || 0}</p>
              </div>
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Seguidores Totais</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview?.totalFollowers || 0}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Nenhum dado de analytics disponível.</div>
          )}
        </div>
      )}

      {/* Inbox Tab */}
      {activeTab === "inbox" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Caixa de Entrada Unificada</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma conversa.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plataforma</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Mensagem</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Não Lidas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Atividade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {conversations.map((conv) => (
                    <tr key={conv._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs bg-gray-100 rounded capitalize">{conv.platform}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium">{conv.contactName}</div>
                        <div className="text-gray-500 text-xs">@{conv.contactHandle}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{conv.lastMessage}</td>
                      <td className="px-4 py-3">
                        {conv.unreadCount > 0 && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">{conv.unreadCount}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          conv.status === "open" ? "bg-green-100 text-green-700" :
                          conv.status === "closed" ? "bg-gray-100 text-gray-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {conv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(conv.lastMessageAt).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}