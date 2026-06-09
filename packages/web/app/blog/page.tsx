import Link from "next/link";
import { fetchPosts } from "@/lib/api";



export default async function BlogPage() {
 const posts = await fetchPosts();

 return (
 <div className="space-y-8">
 <header className="mb-8">
 <h1 className="text-3xl font-display text-center">Blog</h1>
 <p className="text-center text-stone-400 mt-2">
 Artigos, notícias e reflexões da paroquia
 </p>
 </header>

 {posts.data && posts.data.length > 0 ? (
        <div className="space-y-6">
          {posts.data.map((post: any) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block bg-stone-800/50 rounded-lg p-6 hover:bg-stone-800 transition-transform duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-stone-400 font-ui uppercase tracking-wide">
                    {post.category}
                  </span>
                  <span className="text-xs text-stone-500 bg-stone-700/20 px-2 py-0.5 rounded">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <h3 className="font-display text-lg text-white">{post.title}</h3>
                <p className="text-sm text-stone-300 line-clamp-3">{post.excerpt}</p>
                {post.tags && (Array.isArray(post.tags) ? post.tags : JSON.parse(String(post.tags))).length > 0 && (
                 <div className="flex flex-wrap gap-2 mt-3">
                 {(Array.isArray(post.tags) ? post.tags : JSON.parse(String(post.tags))).map((tag: string) => (
                  <span key={tag} className="text-xs bg-stone-700/20 text-stone-400 px-2 py-0.5 rounded">
                  #{tag}
                  </span>
                 ))}
                 </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-stone-500 text-center py-8">
          Nenhum artigo publicado ainda.
        </p>
      )}
    </div>
  );
}