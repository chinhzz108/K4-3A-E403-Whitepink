'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/header';
import { Stepper } from '@/components/stepper';
import { BriefScreen } from '@/components/screens/brief-screen';
import { ResearchScreen } from '@/components/screens/research-screen';
import { SourcesScreen } from '@/components/screens/sources-screen';
import { ScriptScreen } from '@/components/screens/script-screen';
import { Toaster } from '@/components/ui/sonner';
import type { Screen, Source, ResearchBrief } from '@/lib/types';
import { mockSources, mockScenes } from '@/lib/mock-data';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('brief');
  const [brief, setBrief] = useState<ResearchBrief>({
    topic: 'AI Agent là gì và hoạt động như thế nào?',
    learningObjective:
      'Giúp sinh viên hiểu khái niệm AI Agent, cấu trúc cơ bản và ví dụ ứng dụng thực tế.',
    targetAudience: 'Sinh viên năm 1–2',
    videoDuration: '5 phút',
  });
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [scenes] = useState(mockScenes);

  const handleStartResearch = (newBrief: ResearchBrief) => {
    setBrief(newBrief);
    setScreen('research');
  };

  const handleApproveSource = useCallback((id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, approved: true } : s))
    );
  }, []);

  const handleRemoveSource = useCallback((id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, approved: false } : s))
    );
  }, []);

  const handleNewResearch = () => {
    setScreen('brief');
  };

  const handleStepClick = (target: Screen) => {
    setScreen(target);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNewResearch={handleNewResearch} />
      <Stepper current={screen} onStepClick={handleStepClick} />

      <main>
        {screen === 'brief' && (
          <BriefScreen brief={brief} onStart={handleStartResearch} />
        )}
        {screen === 'research' && (
          <ResearchScreen onComplete={() => setScreen('sources')} />
        )}
        {screen === 'sources' && (
          <SourcesScreen
            sources={sources}
            onApprove={handleApproveSource}
            onRemove={handleRemoveSource}
            onGenerate={() => setScreen('script')}
          />
        )}
        {screen === 'script' && (
          <ScriptScreen
            sources={sources}
            scenes={scenes}
            onRemoveSource={handleRemoveSource}
            onBackToSources={() => setScreen('sources')}
          />
        )}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
