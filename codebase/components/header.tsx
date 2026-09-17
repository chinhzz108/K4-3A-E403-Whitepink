'use client';

import { Sparkles, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onNewResearch: () => void;
}

export function Header({ onNewResearch }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ScriptScout</span>
          <Badge
            variant="outline"
            className="ml-1 border-primary/20 bg-primary/5 text-primary"
          >
            Nguyên mẫu
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onNewResearch}
          >
            <Plus className="h-4 w-4" />
            Nghiên cứu mới
          </Button>
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
              VC
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
