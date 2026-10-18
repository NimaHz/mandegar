"use client";

import { Maximize, Minimize, Pause, Play, PlayCircle, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { formatClock } from "@/lib/format";
import { blurProps, FULL_WIDTH_SIZES } from "@/lib/image";
import { aparatEmbedUrl, START_TIME_PARAM } from "@/lib/video";
import type { GuideChapter, GuideVideo } from "@/types/content";

export interface VideoPlayerLabels {
  play: string;
  pause: string;
  mute: string;
  unmute: string;
  fullscreen: string;
  exitFullscreen: string;
  seek: string;
  chapters: string;
  jumpTo: string;
}

interface VideoPlayerProps {
  video: GuideVideo;
  chapters: GuideChapter[];
  title: string;
  durationSec?: number | null;
  labels: VideoPlayerLabels;
  eager?: boolean;
  className?: string;
}

const SEEK_STEP = 5;

interface WebkitVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
}

const parseStartTime = (search: string) => {
  const raw = new URLSearchParams(search).get(START_TIME_PARAM);
  if (!raw || !/^[0-9hms:.]+$/i.test(raw)) return null;
  if (raw.includes(":")) {
    return raw
      .split(":")
      .map(Number)
      .reduce((total, part) => total * 60 + (Number.isFinite(part) ? part : 0), 0);
  }
  const units = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s?)?$/i.exec(raw);
  if (!units) return null;
  const [, hours = "0", minutes = "0", seconds = "0"] = units;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

const activeChapterIndex = (chapters: GuideChapter[], time: number) =>
  chapters.reduce((active, chapter, index) => (time >= chapter.startSec ? index : active), -1);

interface ChapterListProps {
  chapters: GuideChapter[];
  activeIndex: number;
  labels: VideoPlayerLabels;
  onSelect?: (chapter: GuideChapter) => void;
}

function ChapterList({ chapters, activeIndex, labels, onSelect }: ChapterListProps) {
  const locale = useLocale();
  if (chapters.length === 0) return null;

  return (
    <nav aria-label={labels.chapters} className="flex flex-col gap-2">
      <p className="text-label font-bold text-ink">{labels.chapters}</p>
      <ol
        tabIndex={onSelect ? undefined : 0}
        className="-mx-1 scrollbar-none flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {chapters.map((chapter, index) => {
          const clock = formatClock(locale, chapter.startSec);
          const active = index === activeIndex;
          const body = (
            <>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 font-code text-xs font-bold tabular-nums",
                  active ? "bg-on-inverse/15 text-on-inverse" : "bg-primary-soft text-primary",
                )}
              >
                {clock}
              </span>
              <span className="text-sm font-semibold">{chapter.title}</span>
            </>
          );
          return (
            <li key={`${chapter.startSec}-${chapter.title}`} className="shrink-0">
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(chapter)}
                  aria-current={active ? "step" : undefined}
                  aria-label={fill(labels.jumpTo, { title: chapter.title, time: clock })}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border px-2 pe-4 transition-colors",
                    active
                      ? "border-inverse bg-inverse text-on-inverse"
                      : "border-line-strong bg-surface text-ink hover:border-primary hover:text-primary",
                  )}
                >
                  {body}
                </button>
              ) : (
                <span className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-2 pe-4 text-ink">
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function PosterImage({
  video,
  title,
  eager,
}: {
  video: GuideVideo;
  title: string;
  eager: boolean;
}) {
  if (!video.poster) return <div aria-hidden className="absolute inset-0 bg-brand-deep" />;
  return (
    <Image
      src={video.poster.src}
      {...blurProps(video.poster)}
      alt={video.poster.alt || title}
      fill
      sizes={`(min-width: 1024px) 60vw, ${FULL_WIDTH_SIZES}`}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className="object-cover"
    />
  );
}

function PlayBadge({ label }: { label: string }) {
  return (
    <span className="flex flex-col items-center gap-3">
      <span className="grid size-18 place-items-center rounded-full bg-white/95 text-brand-deep shadow-lift ring-8 ring-white/20 transition-transform duration-300 group-hover:scale-105 sm:size-20">
        <Play className="size-8 translate-x-0.5 fill-current" aria-hidden />
      </span>
      <span className="rounded-full bg-night/70 px-3 py-1 text-sm font-bold text-white backdrop-blur">
        {label}
      </span>
    </span>
  );
}

function AparatPlayer({
  video,
  chapters,
  title,
  labels,
  eager = false,
  className,
}: VideoPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  if (video.kind !== "aparat") return null;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="relative aspect-video overflow-hidden rounded-card bg-night shadow-card">
        {loaded ? (
          <iframe
            ref={(frame) => frame?.focus()}
            src={aparatEmbedUrl(video.hash, { autoplay: true })}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="group absolute inset-0 grid place-items-center outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-inset"
          >
            <PosterImage video={video} title={title} eager={eager} />
            <span
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-night/70 via-night/10 to-transparent"
            />
            <span className="relative">
              <PlayBadge label={labels.play} />
            </span>
          </button>
        )}
      </div>
      <ChapterList chapters={chapters} activeIndex={-1} labels={labels} />
    </div>
  );
}

function NativePlayer({
  video,
  chapters,
  title,
  durationSec,
  labels,
  eager = false,
  className,
}: VideoPlayerProps) {
  const locale = useLocale();
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSec ?? 0);

  const seekTo = (seconds: number) => {
    const element = videoRef.current;
    if (!element) return;
    const limit = Number.isFinite(element.duration) ? element.duration : duration;
    element.currentTime = Math.min(Math.max(0, seconds), limit || seconds);
    setCurrent(element.currentTime);
  };

  const syncFromUrl = () => {
    const seconds = parseStartTime(window.location.search);
    if (seconds === null) return;
    seekTo(seconds);
    setStarted(true);
  };

  useEffect(() => {
    const element = videoRef.current;
    if (element && element.readyState >= 1) element.dispatchEvent(new Event("loadedmetadata"));
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    const element = videoRef.current;
    if (!element) return;
    setStarted(true);
    if (element.paused) void element.play().catch(() => setPlaying(false));
    else element.pause();
  };

  const toggleMute = () => {
    const element = videoRef.current;
    if (element) element.muted = !element.muted;
  };

  const toggleFullscreen = () => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    if (document.fullscreenEnabled && typeof shell.requestFullscreen === "function") {
      void shell.requestFullscreen().catch(() => undefined);
      return;
    }
    const element: WebkitVideoElement | null = videoRef.current;
    element?.webkitEnterFullscreen?.();
  };

  const selectChapter = (chapter: GuideChapter) => {
    seekTo(chapter.startSec);
    setStarted(true);
    void videoRef.current?.play().catch(() => setPlaying(false));
    const url = new URL(window.location.href);
    url.searchParams.set(START_TIME_PARAM, String(chapter.startSec));
    window.history.replaceState(null, "", url);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget && event.target !== videoRef.current) return;
    const actions: Partial<Record<string, () => void>> = {
      " ": toggle,
      k: toggle,
      m: toggleMute,
      f: toggleFullscreen,
      ArrowRight: () => seekTo(current + SEEK_STEP),
      ArrowLeft: () => seekTo(current - SEEK_STEP),
      Home: () => seekTo(0),
      End: () => seekTo(duration),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  if (video.kind !== "upload") return null;
  const controlClass =
    "grid size-10 shrink-0 place-items-center rounded-control text-white transition-colors hover:bg-white/15 focus-visible:outline-white";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        ref={shellRef}
        dir="ltr"
        role="group"
        aria-label={title}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="group/player relative aspect-video overflow-hidden rounded-card bg-night shadow-card outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster?.src}
          preload="metadata"
          playsInline
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => {
            if (Number.isFinite(event.currentTarget.duration)) {
              setDuration(event.currentTarget.duration);
            }
            syncFromUrl();
          }}
          onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
          className="absolute inset-0 size-full object-contain"
        />

        {!started && (
          <button
            type="button"
            onClick={() => {
              shellRef.current?.focus();
              toggle();
            }}
            className="group absolute inset-0 grid place-items-center outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-inset"
          >
            <PosterImage video={video} title={title} eager={eager} />
            <span
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-night/70 via-night/10 to-transparent"
            />
            <span className="relative">
              <PlayBadge label={labels.play} />
            </span>
          </button>
        )}

        {started && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-t from-night/85 to-transparent px-3 pt-10 pb-2 transition-opacity duration-300",
              playing &&
                "opacity-0 group-focus-within/player:opacity-100 group-hover/player:opacity-100",
            )}
          >
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.round(duration))}
              step={1}
              value={Math.round(current)}
              onChange={(event) => seekTo(Number(event.target.value))}
              aria-label={labels.seek}
              aria-valuetext={`${formatClock(locale, current)} / ${formatClock(locale, duration)}`}
              className="h-1.5 w-full cursor-pointer accent-primary-glow"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? labels.pause : labels.play}
                className={controlClass}
              >
                {playing ? (
                  <Pause className="size-5 fill-current" aria-hidden />
                ) : (
                  <Play className="size-5 fill-current" aria-hidden />
                )}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? labels.unmute : labels.mute}
                aria-pressed={muted}
                className={controlClass}
              >
                {muted ? (
                  <VolumeX className="size-5" aria-hidden />
                ) : (
                  <Volume2 className="size-5" aria-hidden />
                )}
              </button>
              <span className="px-1 font-code text-xs font-semibold text-white/85 tabular-nums">
                {formatClock(locale, current)} / {formatClock(locale, duration)}
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? labels.exitFullscreen : labels.fullscreen}
                className={controlClass}
              >
                {fullscreen ? (
                  <Minimize className="size-5" aria-hidden />
                ) : (
                  <Maximize className="size-5" aria-hidden />
                )}
              </button>
            </div>
          </div>
        )}

        {started && !playing && (
          <span
            aria-hidden
            className="pointer-events-none absolute start-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-night/60 text-white"
          >
            <PlayCircle className="size-9" />
          </span>
        )}
      </div>
      <ChapterList
        chapters={chapters}
        activeIndex={started ? activeChapterIndex(chapters, current) : -1}
        labels={labels}
        onSelect={selectChapter}
      />
    </div>
  );
}

export function VideoPlayer(props: VideoPlayerProps) {
  return props.video.kind === "aparat" ? <AparatPlayer {...props} /> : <NativePlayer {...props} />;
}
