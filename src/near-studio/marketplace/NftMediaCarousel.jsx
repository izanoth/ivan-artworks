'use client';

import React, { useEffect, useState, useRef } from "react";
import Wavesurfer from "wavesurfer.js";
import "./NftMediaCarousel.css";

function getMediaType(url) {
	if (!url || typeof url !== "string") return "image";
	const lower = url.toLowerCase().split('?')[0];
	if (
		lower.endsWith(".mp4") ||
		lower.endsWith(".webm") ||
		lower.endsWith(".mov") ||
		lower.endsWith(".ogv") ||
		lower.endsWith(".m4v")
	) {
		return "video";
	}
	if (
		lower.endsWith(".mp3") ||
		lower.endsWith(".ogg") ||
		lower.endsWith(".wav") ||
		lower.endsWith(".m4a") ||
		lower.endsWith(".aac")
	) {
		return "audio";
}
	return "image";
}

function VideoPlayer({ src, title }) {
	const videoRef = useRef(null);

	useEffect(() => {
		const video = videoRef.current;
		if (video) {
			// Atualiza a origem e força o recarregamento do vídeo quando o src mudar
			video.load();
			video.muted = true;
			video.play().catch((err) => console.log("Autoplay barrado ou erro:", err));
		}
		
		return () => {
			if (video) {
				video.pause();
				// Removemos o video.src = "" daqui, pois em algumas renderizações do React
				// (como no StrictMode) ele limpava o src logo na montagem do componente.
			}
		};
	}, [src]);

	return (
		<video
			ref={videoRef}
			className="nft-media-video"
			title={title || "NFT Video"}
			autoPlay
			muted
			playsInline
			loop
			controls
		>
			{/* Fornecer a tag source com o type ajuda o navegador a parsear o WebM corretamente */}
			<source src={src} type="video/webm" />
			Seu navegador não suporta a reprodução deste vídeo.
		</video>
	);
}

function AudioWaveformPlayer({ src, title }) {
	const containerRef = useRef(null);
	const wavesurferRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		if (!containerRef.current || !src) return;

		const ws = Wavesurfer.create({
			container: containerRef.current,
			waveColor: '#38bdf8',
			progressColor: '#0284c7',
			cursorColor: '#7dd3fc',
			barWidth: 3,
			barRadius: 3,
			cursorWidth: 1,
			height: 64,
			barGap: 2,
			normalize: true,
		});

		wavesurferRef.current = ws;

		ws.load(src);

		ws.on('ready', () => {
			setIsReady(true);
			ws.play().catch(() => { });
			setIsPlaying(true);
		});

		ws.on('play', () => setIsPlaying(true));
		ws.on('pause', () => setIsPlaying(false));
		ws.on('finish', () => setIsPlaying(false));

		return () => {
			try {
				ws.destroy();
			} catch { }
			wavesurferRef.current = null;
		};
	}, [src]);

	const togglePlay = () => {
		if (wavesurferRef.current) {
			wavesurferRef.current.playPause();
		}
	};

	return (
		<div className="nft-audio-player-container">
			{title && <div className="nft-audio-title">{title}</div>}
			<div ref={containerRef} className="nft-wave-container" />
			<div className="nft-audio-controls-row">
				<button
					type="button"
					className="nft-audio-play-btn"
					onClick={togglePlay}
					disabled={!isReady}
				>
					{isPlaying ? "⏸" : "▶"}
				</button>				
			</div>
		</div>
	);
}

export function normalizeTokenMedia(tokenOrMedia) {
	if (!tokenOrMedia) return [];
	if (Array.isArray(tokenOrMedia)) return tokenOrMedia.filter(Boolean);
	if (typeof tokenOrMedia === 'string') {
		try {
			const parsed = JSON.parse(tokenOrMedia);
			if (Array.isArray(parsed)) return parsed.filter(Boolean);
			if (parsed) return [parsed];
		} catch {
			return [tokenOrMedia];
		}
	}
	const raw = tokenOrMedia.illustrations || tokenOrMedia.media || tokenOrMedia.mediaUrl || tokenOrMedia.image || tokenOrMedia.images;
	if (Array.isArray(raw)) return raw.filter(Boolean);
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) return parsed.filter(Boolean);
			if (parsed) return [parsed];
		} catch {
			return [raw];
		}
	}
	if (tokenOrMedia.metadata && tokenOrMedia.metadata.media) {
		return [tokenOrMedia.metadata.media];
	}
	return [];
}

export default function NftMediaCarousel({ images, mediaItems, title }) {
	const [activeIndex, setActiveIndex] = useState(0);
	const source = mediaItems || images;
	const normalized = normalizeTokenMedia(source);

	if (!normalized.length) {
		return (
			<div className="nft-media-placeholder">
				<span>NFT</span>
			</div>
		);
	}

	const currentItem = normalized[activeIndex] || normalized[0];
	const mediaType = getMediaType(currentItem);
	const canNavigate = normalized.length > 1;

	const previousItem = (e) => {
		e.stopPropagation();
		setActiveIndex((current) =>
			(current - 1 + normalized.length) % normalized.length,
		);
	};

	const nextItem = (e) => {
		e.stopPropagation();
		setActiveIndex((current) => (current + 1) % normalized.length);
	};
	return (
		<div className="nft-media-wrapper">
			{mediaType === "video" && (
				<VideoPlayer key={currentItem} src={currentItem} title={title} />
			)}
			{mediaType === "audio" && (
				<AudioWaveformPlayer key={currentItem} src={currentItem} title={title} />
			)}
			{mediaType === "image" && (
				<img
					key={currentItem}
					className="nft-media-image"
					src={currentItem}
					alt={title || "NFT"}
					loading="lazy"
				/>
			)}

			{canNavigate && (
				<div className="nft-media-controls" aria-label={`Galeria do NFT ${title}`}>

					<button
						type="button"
						className="nft-media-arrow nft-media-arrow-prev"
						onClick={previousItem}
						aria-label="Ver mídia anterior"
					>
						‹
					</button>

					<button
						type="button"
						className="nft-media-arrow nft-media-arrow-next"
						onClick={nextItem}
						aria-label="Ver próxima mídia"
					>
						›
					</button>
				</div>
			)}
		</div>
	);
}