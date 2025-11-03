"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichTextEditor } from "@/components/blog/rich-text-editor";
import { ArrowLeft, Save, Eye, Loader2, X, Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  publishedAt: string | null;
  scheduledFor: string | null;
  categoryId: string | null;
  tags: Array<{ name: string; slug: string }>;
}

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [postId, setPostId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    coverImageKey: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED",
    categoryId: "",
    tags: [] as string[],
    publishedAt: "",
    scheduledFor: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; key: string }>>([]);

  useEffect(() => {
    const initializeParams = async () => {
      const { id } = await params;
      setPostId(id);
      fetchPost(id);
    };
    initializeParams();
  }, []);

  const fetchPost = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/blog/${id}`);
      if (!res.ok) throw new Error("Could not fetch post");
      
      const post: BlogPost = await res.json();
      
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage || "",
        coverImageKey: "",
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        keywords: post.keywords || "",
        status: post.status,
        categoryId: post.categoryId || "",
        tags: post.tags.map(t => t.name),
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : "",
        scheduledFor: post.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0, 16) : "",
      });
    } catch (error) {
      console.error("Failed to fetch post:", error);
      toast({
        title: "Feil!",
        description: "Kunne ikke hente artikkelen",
        variant: "destructive",
      });
      router.push("/admin/blog");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleImageUpload = (url: string, key: string) => {
    setUploadedImages((prev) => [...prev, { url, key }]);
    
    toast({
      title: "Bilde lastet opp!",
      description: "URL kopiert til utklippstavlen",
    });
    
    navigator.clipboard.writeText(url);
  };

  const handleCoverImageUpload = (url: string, key: string) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: url,
      coverImageKey: key,
    }));
    
    toast({
      title: "Hovedbilde oppdatert!",
      description: "Bildet vil vises øverst i artikkelen",
    });
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL kopiert!",
      description: "Bildets URL er kopiert til utklippstavlen",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Kunne ikke oppdatere artikkel");

      toast({
        title: "Artikkel oppdatert!",
        description: "Endringene er lagret",
      });
      router.push("/admin/blog");
    } catch (error) {
      console.error(error);
      toast({
        title: "Feil!",
        description: "Kunne ikke oppdatere artikkelen",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Er du sikker på at du vil slette denne artikkelen? Dette kan ikke angres.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Kunne ikke slette artikkel");

      toast({
        title: "Artikkel slettet!",
        description: "Artikkelen er permanent slettet",
      });
      router.push("/admin/blog");
    } catch (error) {
      console.error(error);
      toast({
        title: "Feil!",
        description: "Kunne ikke slette artikkelen",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Rediger artikkel</h1>
            <p className="text-muted-foreground">
              Oppdater HMS-artikkelen
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sletter...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Slett
              </>
            )}
          </Button>
          <Button variant="outline" type="button">
            <Eye className="mr-2 h-4 w-4" />
            Forhåndsvis
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lagre endringer
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Innhold</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Tittel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="F.eks: Slik gjennomfører du en effektiv risikovurdering"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL-slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/blogg/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="slik-gjennomforer-du-risikovurdering"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Utdrag (meta description) *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="Kort beskrivelse som vises i søkeresultater (155-160 tegn)"
                  rows={3}
                  maxLength={160}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.excerpt.length}/160 tegn
                </p>
              </div>

              <div>
                <Label htmlFor="content">Innhold *</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, content }))
                  }
                  placeholder="Skriv artikkelen din her..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Bruk verktøylinjen for formatering. Du kan sette inn bilder direkte eller bruke URL fra opplastede bilder under.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO-innstillinger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Custom SEO tittel</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
                  }
                  placeholder="La stå tom for å bruke artikkel-tittelen"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Custom meta description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                  placeholder="La stå tom for å bruke utdraget"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords (kommaseparert)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, keywords: e.target.value }))
                  }
                  placeholder="risikovurdering, HMS, arbeidsmiljø, ISO 9001"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publisering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: typeof formData.status) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Kladd</SelectItem>
                    <SelectItem value="PUBLISHED">Publisert</SelectItem>
                    <SelectItem value="SCHEDULED">Planlagt</SelectItem>
                    <SelectItem value="ARCHIVED">Arkivert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === "PUBLISHED" && (
                <div>
                  <Label htmlFor="publishedAt">Publiseringsdato</Label>
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={formData.publishedAt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        publishedAt: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {formData.status === "SCHEDULED" && (
                <div>
                  <Label htmlFor="scheduledFor">Publiser den</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledFor: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Hovedbilde</CardTitle>
              <p className="text-sm text-muted-foreground">
                Vises øverst i artikkelen
              </p>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onUploadComplete={handleCoverImageUpload}
                currentImage={formData.coverImage}
              />
            </CardContent>
          </Card>

          {/* Image Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Bilder for artikkel</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last opp bilder du vil bruke i innholdet
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploader onUploadComplete={handleImageUpload} />
              
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Opplastede bilder</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((img, idx) => (
                      <Card key={idx} className="overflow-hidden">
                        <img
                          src={img.url}
                          alt={`Uploaded ${idx + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <CardContent className="p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => copyImageUrl(img.url)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Kopier URL
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Tips: Bruk Markdown for å sette inn bilder: 
                    <code className="bg-muted px-1 rounded">![Alt text](URL)</code>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Legg til tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Legg til
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

