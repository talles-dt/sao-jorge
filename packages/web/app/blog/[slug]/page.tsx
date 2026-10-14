import Link from "next/link";
import { fetchPost } from "@/lib/api";
import MarkdownBody from "@/components/MarkdownBody";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const result = await fetchPost(slug);
 const post = result.data as { title?: string; body?: string; excerpt?: string } | undefined;

 if (!post) {
 return (
 <div className="space-y-8">
 <p>Post não encontrado.</p>
 <Link href="/blog">Voltar ao blog</Link>
 </div>
 )};

 return (
 <div className="space-y-8">
 <header>
 <Link href="/blog" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition">
 ← Voltar ao blog
 </Link>
 <h1 className="text-3xl font-display mt-4">{post.title}</h1>
 </header>
 <div className="prose prose-lg text-stone-300">
 <MarkdownBody body={post.body ?? post.excerpt ?? ""} />
 </div>
 </div>
 );
}
