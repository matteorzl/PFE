import { useRef, useState, useEffect } from "react";
import { Button, Slider } from "@heroui/react";

export function CustomAudioPlayer({ src, color = "#eee" }: { src: string, color?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(Math.floor(s % 60)).toString().padStart(2, "0")}`;

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
    }
  }, [audioRef]);

  return (
    <div className="flex flex-col mt-3 gap-1 p-3">
      <audio
        controls
        ref={audioRef}
        src={src}
        onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: "none" }}
      />
      <div className="flex items-center gap-2">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={handlePlayPause}
          style={{ color }} 
        >
          {isPlaying ? (
            <svg width={24} height={24} fill="white" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
          ) : (
            <svg width={24} height={24} fill="white" stroke="none"><polygon points="6,4 20,12 6,20 6,4"/></svg>
          )}
        </Button>
        <Slider
          aria-label="Music progress"
          value={[duration ? (current / duration) * 100 : 0]}
          onChange={([v]) => {
            if (audioRef.current && duration) {
              audioRef.current.currentTime = (v / 100) * duration;
            }
          }}
          color="white"
          size="sm"
        />
      </div>
        <div className="flex justify-between">
          <p className="text-small" style={{ color }}>{formatTime(current)}</p>
          <p className="text-small" style={{ color }}>{formatTime(duration)}</p>
        </div>
    </div>
  );
}