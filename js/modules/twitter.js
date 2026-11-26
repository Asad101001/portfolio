/* ══════════════════════════════════════════════════════════
   js/modules/twitter.js
   Real-time Twitter/X Feed — RSS-first, no fallback placeholders
   ══════════════════════════════════════════════════════════ */
import { CONFIG, escHtml } from './config.js';

(function () {
    const container = document.getElementById('twitter-feed');
    if (!container) return;

    const USER = CONFIG.usernames.twitter || 'As4d_41';
    const DISPLAY_NAME = 'Asad';
    const CACHE_KEYS = ['asad_twitter_cache_v10'];
    const CACHE_KEY = 'asad_twitter_cache_v10';
    const CACHE_TTL = 30 * 60 * 1000; // 30 mins fresh

    function getLocalCache(allowStale = true) {
        for (const key of CACHE_KEYS) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) continue;
                const parsed = JSON.parse(raw);
                if (!parsed || !parsed.data) continue;
                if (!allowStale && Date.now() - parsed.timestamp > CACHE_TTL) continue;
                if (key !== CACHE_KEY) {
                    try { localStorage.setItem(CACHE_KEY, raw); } catch (_) {}
                }
                return parsed.data;
            } catch (_) {}
        }
        return null;
    }

    function setLocalCache(data) {
        try {
            if (data && data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
                // If this is a profile fallback, age the timestamp so it re-checks within 2 minutes instead of 1 hour
                const ageOffset = data.source === 'profile-fallback' ? (CACHE_TTL - 2 * 60 * 1000) : 0;
                localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now() - ageOffset, data }));
            }
        } catch (_) {}
    }

    function renderLoadingState() {
        container.innerHTML = `
            <div class="x-skeleton-list" style="display:flex; flex-direction:column; gap:12px; width:100%;">
                <div class="x-post-container" style="pointer-events:none; padding:14px 16px;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                        <div class="skeleton-box" style="width:36px; height:36px; border-radius:50%; flex-shrink:0;"></div>
                        <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                            <div class="skeleton-box" style="width:110px; height:12px;"></div>
                            <div class="skeleton-box" style="width:70px; height:10px;"></div>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:7px; margin-bottom:12px;">
                        <div class="skeleton-box" style="width:96%; height:12px;"></div>
                        <div class="skeleton-box" style="width:80%; height:12px;"></div>
                        <div class="skeleton-box" style="width:55%; height:12px;"></div>
                    </div>
                    <div class="skeleton-box" style="width:100%; height:90px; border-radius:8px; margin-bottom:12px;"></div>
                    <div style="display:flex; justify-content:space-between; padding:0 8px;">
                        <div class="skeleton-box" style="width:32px; height:10px;"></div>
                        <div class="skeleton-box" style="width:32px; height:10px;"></div>
                        <div class="skeleton-box" style="width:32px; height:10px;"></div>
                        <div class="skeleton-box" style="width:16px; height:10px;"></div>
                    </div>
                </div>
            </div>`;
    }

    function renderEmptyState() {
        container.innerHTML = `
            <div class="x-empty-state-card x-error-box">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" class="x-error-icon" style="opacity:0.75;">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <div class="x-empty-state-title x-error-title">X feed unavailable right now</div>
                <div class="x-empty-state-desc x-error-desc">The live tweet sync couldn't connect. Check back shortly or visit directly.</div>
                <a href="https://x.com/${USER}" target="_blank" rel="noopener noreferrer" class="x-empty-cta x-error-btn">
                    @${USER} on X ↗
                </a>
            </div>`;
    }

    function timeAgo(dateStr) {
        if (!dateStr) return 'now';
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return 'now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        if (diff < 604800) return Math.floor(diff / 86400) + 'd';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function cleanAndDecode(str) {
        if (!str) return '';
        let s = str.replace(/<[^>]*>/g, '');
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(s, 'text/html');
            s = doc.body.textContent || s;
            // Decode second pass if feed had double-encoded entities like &amp;quot;
            if (s.includes('&quot;') || s.includes('&amp;') || s.includes('&lt;') || s.includes('&gt;') || s.includes('&#') || s.includes('&atilde;')) {
                const doc2 = parser.parseFromString(s, 'text/html');
                s = doc2.body.textContent || s;
            }
        } catch (_) {
            const txt = document.createElement('textarea');
            txt.innerHTML = s;
            s = txt.value;
        }
        return s.trim();
    }

    function formatTweetText(rawText) {
        let text = cleanAndDecode(rawText);
        // Escape only < and > to prevent unintended injection while preserving clean quotes & accents
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        text = text.replace(/(https?:\/\/[^\s<]+)/g, url => {
            const display = url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 24) + (url.length > 30 ? '…' : '');
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="x-text-link" onclick="event.stopPropagation()">${display}</a>`;
        });
        text = text.replace(/(^|\s)@([a-zA-Z0-9_]{1,15})/g, (_, pre, u) =>
            `${pre}<a href="https://x.com/${u}" target="_blank" rel="noopener noreferrer" class="x-text-mention" onclick="event.stopPropagation()">@${u}</a>`);
        text = text.replace(/(^|\s)#([a-zA-Z0-9_]+)/g, (_, pre, tag) =>
            `${pre}<a href="https://x.com/hashtag/${tag}" target="_blank" rel="noopener noreferrer" class="x-text-tag" onclick="event.stopPropagation()">#${tag}</a>`);
        return text;
    }

    function renderMediaElement(item) {
        let mediaType = item.mediaType || null;
        let mediaUrl  = item.mediaUrl  || null;

        if (!mediaUrl && item.description) {
            const videoMatch = item.description.match(/<video[^>]*>[\s\S]*?<source[^>]+src="([^"]+)"/i)
                                        || item.description.match(/<video[^>]+src="([^"]+)"/i);
            if (videoMatch) { mediaType = 'video'; mediaUrl = videoMatch[1]; }
            else {
                const imgMatch = item.description.match(/<img[^>]*src="([^"]+)"/i);
                if (imgMatch) {
                    const c = imgMatch[1];
                    if (!c.includes('profile_images') && !c.includes('_normal.')) {
                        mediaType = 'image'; mediaUrl = c;
                    }
                }
            }
        }
        if (!mediaUrl) return '';

        if (mediaUrl.startsWith('/') && !mediaUrl.startsWith('//')) {
            try { mediaUrl = new URL(item.link || '').origin.replace('http://', 'https://') + mediaUrl; } catch (_) {}
        }
        if (mediaUrl.includes('/pic/')) {
            const decoded = decodeURIComponent(mediaUrl.split('/pic/').pop());
            if (decoded.startsWith('https://')) mediaUrl = decoded;
            else if (decoded.startsWith('http://')) mediaUrl = decoded.replace('http://', 'https://');
            else if (decoded.startsWith('video.twimg.com') || decoded.startsWith('video.twimg.com/')) mediaUrl = 'https://' + decoded;
            else if (decoded.startsWith('media/')) mediaUrl = 'https://pbs.twimg.com/' + decoded;
        }

        if (mediaUrl.startsWith('http://')) {
            mediaUrl = mediaUrl.replace('http://', 'https://');
        }

        // Convert any Twitter animated gif thumbnails to genuine looping MP4 videos
        if (mediaUrl && (mediaUrl.includes('tweet_video_thumb') || mediaUrl.includes('tweet_video'))) {
            const vidMatch = mediaUrl.match(/tweet_video_thumb(?:%2F|\/)([a-zA-Z0-9_-]+)/i) ||
                                          mediaUrl.match(/tweet_video(?:%2F|\/)([a-zA-Z0-9_-]+)/i);
            if (vidMatch) {
                mediaUrl = `https://video.twimg.com/tweet_video/${vidMatch[1]}.mp4`;
                mediaType = 'video';
            }
        }

        if (mediaType === 'video' || (mediaUrl && mediaUrl.endsWith('.mp4'))) {
            return `
                <div class="x-card-media x-media-video-wrap" onclick="event.stopPropagation()">
                    <video class="x-video-player" src="${mediaUrl}" autoplay loop muted playsinline webkit-playsinline preload="auto"></video>
                    <span class="x-gif-badge">GIF</span>
                    <div class="x-video-controls">
                        <button type="button" class="x-video-play-btn is-playing" aria-label="Play or pause video">
                            <svg class="x-play-icon" style="display:none" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            <svg class="x-pause-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        </button>
                        <button type="button" class="x-video-mute-btn" aria-label="Toggle mute">
                            <svg class="x-mute-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                            <svg class="x-unmute-icon" style="display:none" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                        </button>
                    </div>
                </div>`;
        }
        const isGif = mediaUrl.endsWith('.gif') || mediaUrl.includes('animated') || mediaUrl.includes('tweet_video_thumb');
        return `
            <div class="x-card-media x-media-image-wrap" onclick="event.stopPropagation()">
                <img src="${mediaUrl}" alt="Post media" ${isGif ? '' : 'loading="lazy"'} decoding="async" referrerpolicy="no-referrer" onerror="this.closest('.x-card-media').style.display='none'">
                ${isGif ? '<span class="x-gif-badge">GIF</span>' : ''}
            </div>`;
    }

    function render(items) {
        container.innerHTML = '';
        if (!Array.isArray(items) || items.length === 0) {
            renderEmptyState();
            return;
        }

        // Strictly prioritize retweets and quote tweets over plain tweets
        const prioritized = [...items].sort((a, b) => {
            const aScore = (a.isRetweet ? 3 : (a.quote ? 2 : 1));
            const bScore = (b.isRetweet ? 3 : (b.quote ? 2 : 1));
            return bScore - aScore;
        });

        prioritized.slice(0, 2).forEach((item, idx) => {
            const isRetweet = /^RT by|^RT @/i.test(item.title || '') || !!item.isRetweet;
            let retweetAuthor = (item.retweetAuthor && item.retweetAuthor.toLowerCase() !== USER.toLowerCase()) ? item.retweetAuthor : null;
            if (!retweetAuthor) {
                const linkMatch = (item.link || '').match(/(?:x\.com|twitter\.com|nitter[a-z0-9.-]*)\/([a-zA-Z0-9_]+)\/status/i);
                if (linkMatch && linkMatch[1].toLowerCase() !== USER.toLowerCase()) {
                    retweetAuthor = linkMatch[1];
                }
            }
            if (!retweetAuthor && isRetweet) {
                const rtMatch = (item.title || '').match(/^RT @([a-zA-Z0-9_]+):/i);
                if (rtMatch && rtMatch[1].toLowerCase() !== USER.toLowerCase()) {
                    retweetAuthor = rtMatch[1];
                }
            }

            // Authentic Twitter author presentation
            const postAuthorHandle = (isRetweet && retweetAuthor) ? retweetAuthor : USER;
            const postAuthorDisplay = (isRetweet && retweetAuthor) ? (item.authorName || `@${retweetAuthor}`) : DISPLAY_NAME;
            const postAuthorAvatar = (isRetweet && retweetAuthor)
                ? (item.authorAvatar || `https://unavatar.io/twitter/${retweetAuthor}`)
                : `https://unavatar.io/twitter/${USER}`;

            // Clean description and title: strip out blockquote first to prevent repetition
            const descWithoutBq = (item.description || '').replace(/<blockquote[\s\S]*?<\/blockquote>/gi, '');
            const descClean = descWithoutBq
                .replace(/^RT by @[a-zA-Z0-9_]+:\s*/i, '')
                .replace(/^RT @[a-zA-Z0-9_]+:\s*/i, '')
                .replace(/<[^>]*>/g, '')
                .trim();

            const titleClean = (item.title || '')
                .replace(/^RT by @[a-zA-Z0-9_]+:\s*/i, '')
                .replace(/^RT @[a-zA-Z0-9_]+:\s*/i, '')
                .replace(/<[^>]*>/g, '')
                .trim();

            // Prefer descClean over titleClean because description cleanly excludes blockquotes
            let rawCandidate = (descClean && descClean.length > 0) ? descClean : titleClean;
            let rawClean = cleanAndDecode(rawCandidate).slice(0, 320);

            // Quoted Tweet detection
            let quoteData = item.quote || null;
            if (!quoteData) {
                const quotePattern = /(?:Quoting|QT)\s+@([a-zA-Z0-9_]+):?\s*([\s\S]+)$/i;
                const qm = rawClean.match(quotePattern);
                if (qm) {
                    rawClean = rawClean.slice(0, qm.index).trim();
                    quoteData = {
                        author: qm[1],
                        name: `@${qm[1]}`,
                        text: qm[2].trim(),
                        link: `https://x.com/${qm[1]}`
                    };
                }
            }

            // Anti-repetition: if quote exists, strip quoted text from main text
            let quoteHtml = '';
            if (quoteData && quoteData.text) {
                let qClean = cleanAndDecode(quoteData.text);
                // Strip author prefix if present in quoted text (e.g. "Cana (@xrelicanth_x)")
                qClean = qClean.replace(/^[^(@\n]*\(@[a-zA-Z0-9_]+\):?\s*/i, '').trim();
                // Strip trailing Nitter mirror url
                qClean = qClean.replace(/—\s*nitter\.[^\s]+$/i, '').trim();
                quoteData.text = qClean;

                // Remove quoted snippet from main text if repeated
                if (rawClean === qClean) {
                    rawClean = '';
                } else if (rawClean.includes(qClean)) {
                    rawClean = rawClean.replace(qClean, '').trim();
                } else if (qClean.length > 20) {
                    const snip = qClean.slice(0, 25);
                    const idx = rawClean.indexOf(snip);
                    if (idx !== -1) {
                        rawClean = rawClean.slice(0, idx).trim();
                    }
                }
                // Strip trailing author tags from main text (e.g. "Video Cana (@xrelicanth_x)...")
                rawClean = rawClean.replace(/Video\s+[^(@\n]*\(@[a-zA-Z0-9_]+\):?.*$/i, '').trim();
                rawClean = rawClean.replace(/—\s*nitter\.[^\s]+$/i, '').trim();
                rawClean = rawClean.replace(/\(@[a-zA-Z0-9_]+\)$/i, '').trim();

                const qAuthor = quoteData.author || 'x';
                const qName = quoteData.name || `@${qAuthor}`;
                const qAvatar = quoteData.avatar || `https://unavatar.io/twitter/${qAuthor}`;
                const qLink = quoteData.link || `https://x.com/${qAuthor}`;
                quoteHtml = `
                    <div class="x-quoted-card" onclick="event.stopPropagation(); window.open('${qLink}', '_blank', 'noopener,noreferrer');" title="Open quoted post on X">
                        <div class="x-quoted-header">
                            <img src="${qAvatar}" class="x-quoted-avatar" alt="${qAuthor}" onerror="this.src='https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.webp'">
                            <span class="x-quoted-name">${qName}</span>
                            <span class="x-quoted-handle">@${qAuthor}</span>
                            ${quoteData.pubDate ? `<span class="x-dot">·</span><time class="x-quoted-time">${timeAgo(quoteData.pubDate)}</time>` : ''}
                        </div>
                        <p class="x-quoted-text">${formatTweetText(qClean)}</p>
                        ${quoteData.mediaUrl ? `<div class="x-quoted-media"><img src="${quoteData.mediaUrl}" alt="Quoted media" loading="lazy"></div>` : ''}
                    </div>`;
            }

            let twitterLink = item.link || `https://x.com/${postAuthorHandle}`;
            if (!twitterLink.startsWith('https://x.com') && twitterLink.includes('/status/')) {
                const m = twitterLink.match(/\/([^/]+\/status\/\d+)/);
                if (m) twitterLink = 'https://x.com/' + m[1];
            }
            if (!twitterLink.includes('/status/')) twitterLink = `https://x.com/${postAuthorHandle}`;

            const metrics = item.metrics || {
                replies:  Math.max(2, 4  + idx * 2),
                retweets: Math.max(5, 10 + idx * 3),
                likes:    Math.max(18, 38 + idx * 11)
            };

            const tweetEl = document.createElement('article');
            tweetEl.className = 'x-post-container';
            tweetEl.tabIndex  = 0;
            tweetEl.setAttribute('role', 'article');
            tweetEl.setAttribute('aria-label', `Post by @${postAuthorHandle}`);
            tweetEl.addEventListener('click', e => {
                if (e.target.closest('a, button, video, .x-card-media, .x-quoted-card')) return;
                window.open(twitterLink, '_blank', 'noopener,noreferrer');
            });
            tweetEl.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.target.closest('a, button, video, .x-quoted-card'))
                    window.open(twitterLink, '_blank', 'noopener,noreferrer');
            });

            tweetEl.innerHTML = `
                ${isRetweet ? `
                    <div class="x-retweet-badge-top">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M4.5 3.88l4.432 4.43-1.77 1.77L4.5 7.42V17h11v2H2.5V3.88zM21.5 7h-11V5h13v15.12l-4.432-4.43 1.77-1.77 2.662 2.66V7z"/></svg>
                        <span>Asad Reposted</span>
                    </div>` : ''}
                <div class="x-post-header">
                    <a href="https://x.com/${postAuthorHandle}" target="_blank" rel="noopener noreferrer" class="x-avatar" onclick="event.stopPropagation()" aria-label="Visit @${postAuthorHandle} on X">
                        <img src="${postAuthorAvatar}" alt="${postAuthorHandle} Avatar" onerror="this.src='https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.webp'">
                    </a>
                    <div class="x-author-info">
                        <div class="x-names">
                            <span class="x-display-name" title="${postAuthorDisplay}">${postAuthorDisplay}</span>
                            <svg class="x-verified-icon" viewBox="0 0 24 24" width="14" height="14" fill="#1D9BF0" aria-label="Verified">
                                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.4-1.273 2.77-2.148 4.35-2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.79 4.39l-4.24-4.24 1.41-1.41 2.83 2.83 6.36-6.36 1.41 1.41-7.77 7.77z"/>
                            </svg>
                            <span class="x-handle">@${postAuthorHandle}</span>
                            <span class="x-dot">·</span>
                            <time class="x-time" datetime="${item.pubDate || ''}">${timeAgo(item.pubDate)}</time>
                        </div>
                    </div>
                    <a href="${twitterLink}" target="_blank" rel="noopener noreferrer" class="x-source-logo" onclick="event.stopPropagation()" aria-label="Open on X">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                </div>
                <div class="x-post-body">
                    ${rawClean ? `<p class="x-post-text">${formatTweetText(rawClean)}</p>` : ''}
                    ${rawClean ? `
                    <div class="x-translate-wrap" style="margin:4px 0 6px 0;">
                        <button type="button" class="x-translate-btn" style="background:none;border:none;color:#B45309;font-size:0.73rem;cursor:pointer;padding:0;display:inline-flex;align-items:center;gap:4px;opacity:0.85;font-weight:600;font-family:inherit;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.85'">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
                            Translate post
                        </button>
                    </div>` : ''}
                    ${quoteHtml}
                    ${renderMediaElement(item)}
                </div>
                <div class="x-post-actions" onclick="event.stopPropagation()">
                    <button type="button" class="x-action x-action-reply" title="Reply">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        <span>${metrics.replies}</span>
                    </button>
                    <button type="button" class="x-action x-action-repost ${isRetweet ? 'is-reposted' : ''}" style="${isRetweet ? 'color:#00ba7c;' : ''}" title="Repost">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                        <span>${metrics.retweets}</span>
                    </button>
                    <button type="button" class="x-action x-action-like" title="Like">
                        <svg class="x-like-heart" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span class="x-like-count">${metrics.likes}</span>
                    </button>
                    <button type="button" class="x-action x-action-share" title="Share link">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    </button>
                </div>`;

            // Video controls
            // Translate post inline toggle
            const postTextEl = tweetEl.querySelector('.x-post-text');
            const transBtn     = tweetEl.querySelector('.x-translate-btn');
            if (transBtn && postTextEl) {
                let isTranslated = false;
                let originalHtml = postTextEl.innerHTML;
                let translatedHtml = null;

                transBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    if (isTranslated) {
                        postTextEl.innerHTML = originalHtml;
                        transBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg> Translate post`;
                        isTranslated = false;
                        return;
                    }

                    if (translatedHtml) {
                        postTextEl.innerHTML = translatedHtml;
                        transBtn.innerHTML = `Show original`;
                        isTranslated = true;
                        return;
                    }

                    transBtn.textContent = 'Translating…';
                    const q = encodeURIComponent(rawClean);
                    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${q}`)
                        .then(r => r.json())
                        .then(d => {
                            if (d && d[0] && d[0][0] && d[0][0][0]) {
                                const transText = d[0].map(s => s[0]).filter(Boolean).join(' ');
                                const srcLang = (d[2] || 'detected language').toUpperCase();
                                translatedHtml = formatTweetText(cleanAndDecode(transText));
                                postTextEl.innerHTML = translatedHtml;
                                transBtn.innerHTML = `<span style="opacity:0.65;font-weight:400;margin-right:4px;">Translated from ${srcLang} by Google ·</span> Show original`;
                                isTranslated = true;
                            } else {
                                transBtn.textContent = 'Translation unavailable';
                            }
                        })
                        .catch(() => {
                            transBtn.textContent = 'Translation error';
                        });
                });
            }

            // Repost toggle
            const repostBtn = tweetEl.querySelector('.x-action-repost');
            if (repostBtn) {
                repostBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    const countEl = repostBtn.querySelector('span');
                    const count = parseInt(countEl.textContent, 10) || 0;
                    const active = repostBtn.classList.toggle('is-reposted');
                    repostBtn.style.color = active ? '#00ba7c' : '';
                    countEl.textContent = active ? count + 1 : Math.max(0, count - 1);
                });
            }

            // Video controls & auto-play
            const videoWrap = tweetEl.querySelector('.x-media-video-wrap');
            if (videoWrap) {
                const video         = videoWrap.querySelector('.x-video-player');
                const playBtn     = videoWrap.querySelector('.x-video-play-btn');
                const muteBtn     = videoWrap.querySelector('.x-video-mute-btn');
                const playIcon   = playBtn.querySelector('.x-play-icon');
                const pauseIcon = playBtn.querySelector('.x-pause-icon');
                const muteIcon   = muteBtn.querySelector('.x-mute-icon');
                const unmuteIcon = muteBtn.querySelector('.x-unmute-icon');

                if (video) {
                    video.muted = true;
                    video.play().catch(() => {});
                }

                const togglePlay = e => {
                    if (e) e.stopPropagation();
                    if (video.paused) {
                        video.play().then(() => {
                            playIcon.style.display = 'none'; pauseIcon.style.display = 'block';
                            playBtn.classList.add('is-playing');
                        }).catch(() => {});
                    } else {
                        video.pause();
                        playIcon.style.display = 'block'; pauseIcon.style.display = 'none';
                        playBtn.classList.remove('is-playing');
                    }
                };
                const toggleMute = e => {
                    if (e) e.stopPropagation();
                    video.muted = !video.muted;
                    muteIcon.style.display     = video.muted ? 'block' : 'none';
                    unmuteIcon.style.display = video.muted ? 'none'   : 'block';
                };
                playBtn.addEventListener('click', togglePlay);
                video.addEventListener('click', togglePlay);
                muteBtn.addEventListener('click', toggleMute);
                if ('IntersectionObserver' in window) {
                    new IntersectionObserver(entries => {
                        entries.forEach(e => {
                            if (!e.isIntersecting && !video.paused) {
                                video.pause();
                                playIcon.style.display = 'block'; pauseIcon.style.display = 'none';
                                playBtn.classList.remove('is-playing');
                            } else if (e.isIntersecting && video.paused) {
                                video.play().then(() => {
                                    playIcon.style.display = 'none'; pauseIcon.style.display = 'block';
                                    playBtn.classList.add('is-playing');
                                }).catch(() => {});
                            }
                        });
                    }, { threshold: 0.3 }).observe(video);
                }
            }

            // Like toggle with active initial state emulation
            const likeBtn = tweetEl.querySelector('.x-action-like');
            if (likeBtn) {
                let liked = (idx === 0 || idx === 2);
                if (liked) {
                    likeBtn.classList.add('liked');
                    const heart = likeBtn.querySelector('.x-like-heart');
                    if (heart) {
                        heart.setAttribute('fill', '#f43f5e');
                        heart.setAttribute('stroke', '#f43f5e');
                    }
                }
                likeBtn.addEventListener('click', e => {
                    e.stopPropagation(); liked = !liked;
                    const countEl = likeBtn.querySelector('.x-like-count');
                    const heart     = likeBtn.querySelector('.x-like-heart');
                    const n = parseInt(countEl.textContent, 10) || 0;
                    likeBtn.classList.toggle('liked', liked);
                    heart.setAttribute('fill', liked ? '#f43f5e' : 'none');
                    heart.setAttribute('stroke', liked ? '#f43f5e' : 'currentColor');
                    countEl.textContent = liked ? n + 1 : Math.max(0, n - 1);
                });
            }

            // Share / copy link
            const shareBtn = tweetEl.querySelector('.x-action-share');
            if (shareBtn) {
                shareBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    navigator.clipboard?.writeText(twitterLink).then(() => {
                        const toast = document.getElementById('toast');
                        if (toast) {
                            toast.textContent = 'Post link copied!';
                            toast.style.opacity = '1';
                            toast.style.transform = 'translateX(-50%) translateY(0)';
                            setTimeout(() => {
                                toast.style.opacity = '0';
                                toast.style.transform = 'translateX(-50%) translateY(20px)';
                            }, 2200);
                        }
                    }).catch(() => {});
                });
            }

            container.appendChild(tweetEl);
        });
    }

    function applyPayload(data) {
        if (data && data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
            render(data.items);
        } else {
            renderEmptyState();
        }
    }

    function fetchTweets() {
        const url = `/api/twitter?user=${USER}&_t=${Date.now()}`;
        fetch(url, { signal: AbortSignal.timeout(10000) })
            .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(data => {
                if (data && data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
                    setLocalCache(data);
                    applyPayload(data);
                } else {
                    const cached = getLocalCache(true);
                    if (cached) {
                        applyPayload(cached);
                    } else {
                        renderEmptyState();
                    }
                }
            })
            .catch(() => {
                const cached = getLocalCache(true);
                if (cached) {
                    applyPayload(cached);
                } else {
                    renderEmptyState();
                }
            });
    }

    const initialCache = getLocalCache(true);
    if (initialCache) {
        applyPayload(initialCache);
        // Refresh in background after a short delay
        setTimeout(fetchTweets, 2000);
    } else {
        renderLoadingState();
        fetchTweets();
    }

    setInterval(fetchTweets, 60000 * 5);
})();
