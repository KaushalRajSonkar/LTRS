'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    SkipBack,
    SkipForward,
    Settings,
    Loader2
} from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    title?: string;
    onProgress?: (seconds: number) => void;
    onEnded?: () => void;
    initialTime?: number;
    autoPlay?: boolean;
}

export default function VideoPlayer({
    src,
    title,
    onProgress,
    onEnded,
    initialTime = 0,
    autoPlay = false
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    // Initialize HLS
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        setIsLoading(true);
        setError(null);

        if (src.includes('.m3u8')) {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });

                hls.loadSource(src);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setIsLoading(false);
                    if (initialTime > 0) {
                        video.currentTime = initialTime;
                    }
                    if (autoPlay) {
                        video.play().catch(() => { });
                    }
                });

                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (data.fatal) {
                        setError('Failed to load video');
                        setIsLoading(false);
                    }
                });

                hlsRef.current = hls;

                return () => {
                    hls.destroy();
                };
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari native HLS support
                video.src = src;
                video.addEventListener('loadedmetadata', () => {
                    setIsLoading(false);
                    if (initialTime > 0) {
                        video.currentTime = initialTime;
                    }
                    if (autoPlay) {
                        video.play().catch(() => { });
                    }
                });
            }
        } else {
            // Regular video
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
                setIsLoading(false);
                if (initialTime > 0) {
                    video.currentTime = initialTime;
                }
                if (autoPlay) {
                    video.play().catch(() => { });
                }
            });
        }
    }, [src, initialTime, autoPlay]);

    // Time update
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (onProgress) {
                onProgress(video.currentTime);
            }
        };

        const handleDurationChange = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            if (onEnded) {
                onEnded();
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplay', handleCanPlay);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplay', handleCanPlay);
        };
    }, [onProgress, onEnded]);

    // Controls visibility
    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    }, [isPlaying]);

    // Fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const seek = (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        const progress = progressRef.current;
        if (!video || !progress) return;

        const rect = progress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.currentTime = percent * video.duration;
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (error) {
        return (
            <div className="video-container flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <p className="text-gray-500 text-sm">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="video-container group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                className="w-full h-full"
                playsInline
                onClick={togglePlay}
            />

            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
            )}

            {/* Play Button Overlay */}
            {!isPlaying && !isLoading && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                </div>
            )}

            {/* Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Progress Bar */}
                <div
                    ref={progressRef}
                    className="h-1 mx-4 mb-2 bg-white/30 rounded-full cursor-pointer group/progress"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full bg-purple-500 rounded-full relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center gap-2 px-4 pb-3">
                    <button
                        onClick={togglePlay}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" />
                        ) : (
                            <Play className="w-5 h-5 text-white" />
                        )}
                    </button>

                    <button
                        onClick={() => seek(-10)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                        <SkipBack className="w-5 h-5 text-white" />
                    </button>

                    <button
                        onClick={() => seek(10)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                        <SkipForward className="w-5 h-5 text-white" />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-2 group/volume">
                        <button
                            onClick={toggleMute}
                            className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="w-5 h-5 text-white" />
                            ) : (
                                <Volume2 className="w-5 h-5 text-white" />
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-0 group-hover/volume:w-20 transition-all duration-200 accent-purple-500"
                        />
                    </div>

                    {/* Time */}
                    <div className="ml-2 text-sm text-white/80 font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    <div className="flex-1" />

                    {/* Title */}
                    {title && (
                        <span className="text-sm text-white/80 truncate max-w-[200px]">
                            {title}
                        </span>
                    )}

                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                        <Maximize className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
