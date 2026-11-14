export function LoaderView({ progress }: { progress: number }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-background">
      <span className="font-display text-3xl font-bold tracking-[0.3em] text-foreground">
        DRIFT
      </span>
      <div className="h-px w-48 overflow-hidden bg-border">
        <div
          className="h-full bg-cyan transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="font-mono text-xs tracking-[0.12em] text-cyan">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
