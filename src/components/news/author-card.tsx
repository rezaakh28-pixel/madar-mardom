import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Author } from "@/types";

export function AuthorCard({ author }: { author: Author }) {
  return (
    <Link
      href={`/author/${author.username}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={author.avatarUrl} alt={author.name} />
        <AvatarFallback>{author.name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-foreground">{author.name}</p>
        <p className="text-xs text-muted-foreground">{author.title}</p>
      </div>
    </Link>
  );
}
