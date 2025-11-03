"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Eye, Edit, Trash2, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  publishedAt: string | null;
  viewCount: number;
  category: {
    name: string;
    color: string;
  } | null;
  author: {
    name: string;
  };
  createdAt: string;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/blog");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: BlogPost["status"]) => {
    const variants = {
      DRAFT: { label: "Kladd", variant: "secondary" as const },
      PUBLISHED: { label: "Publisert", variant: "default" as const },
      SCHEDULED: { label: "Planlagt", variant: "outline" as const },
      ARCHIVED: { label: "Arkivert", variant: "destructive" as const },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne artikkelen?")) return;
    
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Kunne ikke slette");
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
      alert("Kunne ikke slette artikkelen");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blogg & Artikler</h1>
          <p className="text-muted-foreground mt-1">
            Skriv HMS-artikler for bedre SEO og organisk trafikk
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Ny artikkel
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Totalt publisert</CardDescription>
            <CardTitle className="text-3xl">
              {posts.filter(p => p.status === "PUBLISHED").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kladder</CardDescription>
            <CardTitle className="text-3xl">
              {posts.filter(p => p.status === "DRAFT").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Totale visninger</CardDescription>
            <CardTitle className="text-3xl">
              {posts.reduce((sum, p) => sum + p.viewCount, 0).toLocaleString("nb-NO")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Planlagt</CardDescription>
            <CardTitle className="text-3xl">
              {posts.filter(p => p.status === "SCHEDULED").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Link href="/admin/blog/categories">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Kategorier
          </Button>
        </Link>
        <Link href="/admin/blog/tags">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Tags
          </Button>
        </Link>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle artikler</CardTitle>
          <CardDescription>
            Administrer dine blogg-artikler og forbedre SEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin mb-4" />
              <p className="text-muted-foreground">Laster artikler...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ingen artikler ennå</h3>
              <p className="text-muted-foreground mb-4">
                Kom i gang med å skrive din første HMS-artikkel
              </p>
              <Link href="/admin/blog/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Opprett første artikkel
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tittel</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visninger</TableHead>
                  <TableHead>Publisert</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground">
                          /{post.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.category && (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: post.category.color,
                            color: post.category.color,
                          }}
                        >
                          {post.category.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        {post.viewCount.toLocaleString("nb-NO")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.publishedAt
                        ? format(new Date(post.publishedAt), "d. MMM yyyy", {
                            locale: nb,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/blogg/${post.slug}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Forhåndsvis
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/blog/${post.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Rediger
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(post.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Slett
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

