import Link from "next/link";

export async function generateStaticParams() {
 return [
 { slug: "natal-2024" },
 { slug: "pascoa-2025" },
 ];
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 // TODO: Fetch actual post from /api/blog/:slug once API is fixed.
 // Temporarily mock the content.
 interface MockPost {
 title: string;
 content: string;
 }
 const posts: Record<string, MockPost> = {
 "natal-2024": {
 title: "Reflexões para o Natal de 2024",
 content: "Conteúdo do post sobre o Natal de 2024.",
 },
 "pascoa-2025": {
 title: "A Ressurreição e o Mistério Pascal",
 content: "Conteúdo do post sobre a Páscoa de 2025.",
 },
 };
 const post = posts[slug];

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
 <p>{post.content}</p>
 </div>
 </div>
 );
}
