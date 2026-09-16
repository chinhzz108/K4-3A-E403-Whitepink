'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Eye, FileCheck2, Search, ArrowRight } from 'lucide-react';
import type { ResearchBrief } from '@/lib/types';

interface BriefScreenProps {
  brief: ResearchBrief;
  onStart: (brief: ResearchBrief) => void;
}

const trustIndicators = [
  { icon: FileCheck2, label: 'Luận điểm có dẫn nguồn' },
  { icon: Eye, label: 'Con người duyệt lại' },
  { icon: ShieldCheck, label: 'Xác minh trích dẫn' },
];

const audiences = [
  'Sinh viên năm 1–2',
  'Sinh viên CNTT',
  'Người mới học AI',
  'Người đi làm',
];

const durations = ['3 phút', '5 phút', '8 phút', '10 phút'];

export function BriefScreen({ brief, onStart }: BriefScreenProps) {
  const [form, setForm] = useState<ResearchBrief>(brief);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: Hero */}
        <div className="flex flex-col justify-center">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Search className="h-3.5 w-3.5" />
            Nghiên cứu AI & Viết kịch bản
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Biến nghiên cứu đáng tin cậy thành kịch bản video{' '}
            <span className="text-primary">có dẫn nguồn</span>.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            ScriptScout tìm kiếm trên web, đánh giá độ tin cậy của nguồn, và
            kết nối từng luận điểm trong kịch bản với bằng chứng hỗ trợ.
          </p>

          <div className="mt-8 flex flex-wrap gap-5">
            {trustIndicators.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <Card className="border-border p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Yêu cầu nghiên cứu</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Xác định chủ đề và đối tượng để bắt đầu.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium">
                Chủ đề
              </Label>
              <Input
                id="topic"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective" className="text-sm font-medium">
                Mục tiêu học tập
              </Label>
              <Textarea
                id="objective"
                value={form.learningObjective}
                onChange={(e) =>
                  setForm({ ...form, learningObjective: e.target.value })
                }
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Đối tượng mục tiêu</Label>
                <Select
                  value={form.targetAudience}
                  onValueChange={(v) =>
                    setForm({ ...form, targetAudience: v })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Thời lượng video</Label>
                <Select
                  value={form.videoDuration}
                  onValueChange={(v) =>
                    setForm({ ...form, videoDuration: v })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              size="lg"
              className="mt-2 w-full gap-2"
              onClick={() => onStart(form)}
            >
              Bắt đầu nghiên cứu
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
