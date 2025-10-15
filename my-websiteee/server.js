<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale-1.0">
    <title>StreamFlix - A Netflix-Style Player</title>
    <!-- Video.js CSS -->
    <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #141414; /* Netflix black */
        }
        #heroSection {
            transition: background-image 0.5s ease-in-out;
        }
        .hero-gradient {
            background-image: linear-gradient(to top, #141414, rgba(20, 20, 20, 0) 50%);
        }
        .movie-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .movie-card:hover {
            transform: scale(1.05);
            z-index: 10;
        }
        .movie-carousel {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none;  /* Internet Explorer 10+ */
        }
        .movie-carousel::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
        }
        .modal.hidden {
            display: none;
        }
        .carousel-container:hover .scroll-btn {
            opacity: 1;
        }
        .scroll-btn {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 50px;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            cursor: pointer;
            z-index: 20;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
            padding-bottom: 1rem; /* To align with the padding of the carousel */
        }
        .scroll-btn.left {
            left: 0;
            border-top-right-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
        }
        .scroll-btn.right {
            right: 0;
            border-top-left-radius: 0.5rem;
            border-bottom-left-radius: 0.5rem;
        }
        #streamsCarouselContainer .scroll-btn {
             padding-bottom: 0;
             height: 100%;
        }

        /* NEW Professional Player Skin */
        .video-js.vjs-fluid, .video-js.vjs-16-9, .video-js.vjs-4-3 {
            border-radius: 0.5rem;
        }
        .video-js .vjs-control-bar {
            background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0));
            height: 4em;
            display: flex;
            align-items: center;
            padding: 0 1em;
        }
        .video-js .vjs-big-play-button {
            background-color: rgba(20, 20, 20, 0.6) !important;
            border: 2px solid rgba(255, 255, 255, 0.8) !important;
            width: 3em !important;
            height: 3em !important;
            line-height: 3em !important;
            border-radius: 50%;
            margin-top: -1.5em !important;
            margin-left: -1.5em !important;
            transition: all 0.2s ease;
        }
        .video-js:hover .vjs-big-play-button {
            background-color: rgba(229, 9, 20, 0.8) !important;
            border-color: white !important;
        }
        .video-js .vjs-progress-control {
           /* This is the FIX: let it be part of the flex layout and grow */
           flex-grow: 1;
           position: relative; /* Keep it in the flow */
           width: auto;
           top: auto;
           margin: 0 1em; /* Add space around the progress bar */
        }
        .video-js .vjs-time-control {
            font-size: 1em;
            padding: 0 0.5em;
        }
        .video-js .vjs-play-progress, .video-js .vjs-volume-level {
            background-color: #e50914;
        }
        .video-js .vjs-slider {
            background-color: rgba(255, 255, 255, 0.3);
        }
        .video-js .vjs-menu-button-popup .vjs-menu {
            background-color: rgba(20, 20, 20, 0.9);
            border-radius: 0.5rem;
        }
    </style>
</head>
<body class="text-gray-200">

    <!-- Header / Navbar -->
    <header class="fixed top-0 left-0 right-0 z-50 p-4 transition-colors duration-300 bg-gradient-to-b from-black/80 to-transparent">
        <div class="w-full mx-auto flex items-center justify-between px-4 md:px-8">
            <h1 class="text-2xl md:text-3xl font-extrabold text-red-600 tracking-wider">STREAMFLIX</h1>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-4 bg-gray-900/50 border border-gray-700 rounded-full px-3 py-1.5">
                    <input type="text" id="searchInput" placeholder="Search movies & series..." class="bg-transparent text-white placeholder-gray-400 focus:outline-none w-32 sm:w-48 md:w-64">
                    <button id="searchBtn">
                        <i data-lucide="search" class="w-5 h-5 text-gray-400 hover:text-white transition-colors"></i>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <main class="pt-24">
        <!-- Hero Section -->
        <section id="heroSection" class="relative h-[40vh] md:h-[50vh] flex items-end text-white p-6 md:p-12" style="background-image: url('https://placehold.co/1920x1080/141414/141414?text='); background-size: cover; background-position: center top;">
             <div class="absolute inset-0 hero-gradient"></div>
             <div class="relative z-10 max-w-xl lg:max-w-3xl px-4 md:px-8">
                <h2 id="heroTitle" class="text-3xl md:text-5xl font-extrabold drop-shadow-lg">Loading...</h2>
                <p id="heroOverview" class="mt-4 text-xs md:text-sm max-w-prose drop-shadow-md">
                    Fetching the latest content for you.
                </p>
            </div>
        </section>
        
        <div id="errorMessage" class="my-4 text-red-500 text-center font-medium container mx-auto"></div>
        
        <!-- Movie Rows Container -->
        <div id="movieRows" class="space-y-12 py-8 px-4 md:px-8">
             <!-- Rows will be injected here -->
        </div>
    </main>

    <!-- Player Modal -->
    <div id="playerModal" class="modal hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="relative w-full max-w-screen-xl bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <button id="closePlayerModalBtn" class="absolute top-3 right-3 z-20 text-gray-400 hover:text-white bg-black/50 rounded-full p-1">
                <i data-lucide="x" class="w-7 h-7"></i>
            </button>
            <div class="bg-black flex-shrink-0">
                 <video id="videoPlayer" class="video-js vjs-big-play-centered w-full h-auto" controls preload="auto"></video>
            </div>
            <div class="flex flex-col p-4 bg-gray-800 overflow-y-auto">
                <div id="modalMovieInfo" class="mb-4 flex-shrink-0">
                    <h2 id="modalMovieTitle" class="text-2xl font-bold text-white"></h2>
                </div>
                <h3 class="text-lg font-semibold mb-3 text-white border-b border-gray-600 pb-2 flex-shrink-0">Available Streams</h3>
                <div id="streamsCarouselContainer" class="carousel-container relative">
                     <div id="streamsList" class="movie-carousel flex overflow-x-auto space-x-4 py-2"></div>
                    <button class="scroll-btn left"><i data-lucide="chevron-left" class="w-8 h-8"></i></button>
                    <button class="scroll-btn right"><i data-lucide="chevron-right" class="w-8 h-8"></i></button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
    <script>
        lucide.createIcons();
        
        // --- CONFIGURATION ---
        const TMDB_API_KEY = 'a1e72fd93ed59f56e6332813b9f8dcae';
        const RD_API_KEY = 'FHOB2OWVWWUJYKN4RWBQY3RI2HL2O2UUSTX5ZZKCBOGXX2I72J4Q';
        const RD_API_BASE = 'https://api.real-debrid.com/rest/1.0';
        const CORS_PROXY = 'https://corsproxy.io/?';
        
        // --- CONSTANTS ---
        const TMDB_API_BASE = 'https://api.themoviedb.org/3';
        const TMDB_IMAGE_BASE_POSTER = 'https://image.tmdb.org/t/p/w500';
        const TMDB_IMAGE_BASE_BACKDROP = 'https://image.tmdb.org/t/p/original';

        // --- DOM Elements ---
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const errorMessage = document.getElementById('errorMessage');
        const movieRowsContainer = document.getElementById('movieRows');
        const playerModal = document.getElementById('playerModal');
        const closePlayerModalBtn = document.getElementById('closePlayerModalBtn');
        const streamsList = document.getElementById('streamsList');
        const modalMovieTitle = document.getElementById('modalMovieTitle');
        const heroSection = document.getElementById('heroSection');
        const heroTitle = document.getElementById('heroTitle');
        const heroOverview = document.getElementById('heroOverview');

        // --- VIDEO PLAYER INSTANCE ---
        const player = videojs('videoPlayer', { 
            aspectRatio: '16:9', 
            fluid: true,
            controls: true,
            controlBar: {
                children: [
                    'playToggle', 'volumePanel', 'currentTimeDisplay', 'timeDivider', 'durationDisplay', 'progressControl', 'remainingTimeDisplay',
                    'customControlSpacer', 'playbackRateMenuButton', 'audioTrackButton', 'fullscreenToggle'
                ]
            }
        });

        // --- EVENT LISTENERS ---
        searchBtn.addEventListener('click', searchContent);
        searchInput.addEventListener('keyup', e => e.key === 'Enter' && searchContent());
        closePlayerModalBtn.addEventListener('click', closeModal);
        playerModal.addEventListener('click', e => e.target === playerModal && closeModal());
        

        // --- CORE LOGIC ---

        async function playStreamWithRealDebrid(stream, selectedElement) {
            if (!RD_API_KEY) {
                displayError("Real-Debrid API Key is not set in the script.");
                return;
            }
            player.poster(`https://placehold.co/1280x720/141414/ffffff?text=Please%20wait...`);
            try {
                const magnet = `magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(stream.title)}`;
                const addMagnetUrl = `${CORS_PROXY}${encodeURIComponent(`${RD_API_BASE}/torrents/addMagnet`)}`;
                const addMagnetResponse = await fetch(addMagnetUrl, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${RD_API_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `magnet=${encodeURIComponent(magnet)}`
                });
                if (addMagnetResponse.status === 401) throw new Error("Real-Debrid API Key is invalid.");
                if (!addMagnetResponse.ok) throw new Error(`Failed to add magnet. Status: ${addMagnetResponse.status}`);
                const torrentData = await addMagnetResponse.json();
                const selectFilesUrl = `${CORS_PROXY}${encodeURIComponent(`${RD_API_BASE}/torrents/selectFiles/${torrentData.id}`)}`;
                await fetch(selectFilesUrl, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${RD_API_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'files=all'
                });
                let attempts = 0;
                while (attempts < 20) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    const infoUrl = `${CORS_PROXY}${encodeURIComponent(`${RD_API_BASE}/torrents/info/${torrentData.id}`)}`;
                    const infoResponse = await fetch(infoUrl, { headers: { 'Authorization': `Bearer ${RD_API_KEY}` } });
                    if (!infoResponse.ok) { attempts++; continue; }
                    const torrentInfo = await infoResponse.json();
                    if (torrentInfo.status === 'downloaded' && torrentInfo.links && torrentInfo.links.length > 0) {
                        let videoFileIndex = 0;
                        if (torrentInfo.files.length > 1) {
                            let maxSize = 0;
                            torrentInfo.files.forEach((file, index) => {
                                if (file.bytes > maxSize && (file.path.endsWith('.mkv') || file.path.endsWith('.mp4'))) {
                                    maxSize = file.bytes;
                                    videoFileIndex = index;
                                }
                            });
                        }
                        const streamingLink = torrentInfo.links[videoFileIndex];
                        const unrestrictUrl = `${CORS_PROXY}${encodeURIComponent(`${RD_API_BASE}/unrestrict/link`)}`;
                        const unrestrictResponse = await fetch(unrestrictUrl, {
                           method: 'POST',
                           headers: { 'Authorization': `Bearer ${RD_API_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                           body: `link=${encodeURIComponent(streamingLink)}`
                        });
                        if(!unrestrictResponse.ok) throw new Error("Failed to unrestrict Real-Debrid link.");
                        const unrestrictData = await unrestrictResponse.json();
                        player.src({ src: unrestrictData.download, type: 'video/mp4' });
                        player.play().catch(err => displayError("Autoplay failed. Press play."));
                        document.querySelectorAll('#streamsList > div').forEach(item => item.classList.remove('bg-red-600'));
                        selectedElement.classList.add('bg-red-600');
                        return;
                    }
                    const progress = torrentInfo.progress ? `(${torrentInfo.progress}%)` : '';
                    player.poster(`https://placehold.co/1280x720/141414/ffffff?text=Real-Debrid Status: ${torrentInfo.status} ${progress}`);
                    attempts++;
                }
                throw new Error("Stream took too long to prepare on Real-Debrid.");
            } catch (error) {
                console.error('Real-Debrid error:', error);
                displayError(error.message);
                player.poster(`https://placehold.co/1280x720/141414/e50914?text=Error:+Could+not+load+stream`);
            }
        }
        
        // --- DATA FETCHING & DISPLAY ---
        
        async function fetchAndDisplayStreams(imdbId, mediaType) {
            streamsList.innerHTML = '<p class="text-gray-400">Searching for torrent streams...</p>';
            try {
                const torrentProviderUrl = `https://torrentio.strem.fun/stream/${mediaType}/${imdbId}.json`;
                const response = await fetch(torrentProviderUrl);
                if (!response.ok) throw new Error(`Torrent provider error (Status: ${response.status})`);
                const data = await response.json();
                
                if (data.streams && data.streams.length > 0) {
                    streamsList.innerHTML = '';
                    data.streams.sort((a,b) => (b.title.match(/👤\s*(\d+)/) || [0,0])[1] - (a.title.match(/👤\s*(\d+)/) || [0,0])[1]);
                    data.streams.forEach(stream => {
                        const info = parseStreamInfo(stream);
                        if (!info.quality) return;
                        const streamItem = document.createElement('div');
                        streamItem.className = 'bg-gray-700/80 p-3 rounded-lg cursor-pointer transition-colors hover:bg-red-600 flex-shrink-0 w-60 md:w-64 flex flex-col justify-between';
                        streamItem.innerHTML = `
                            <div><p class="font-semibold text-xs text-gray-200 whitespace-pre-wrap break-words">${info.fileName}</p></div>
                            <div class="mt-2 pt-2 border-t border-gray-600/50 space-y-2">
                                <div class="flex justify-end items-center"><div class="flex-shrink-0 flex items-center space-x-1.5">
                                    <span class="text-[10px] bg-red-600 text-white font-bold rounded px-1.5 py-0.5">${info.quality}</span>
                                    <span class="text-[10px] bg-blue-600 text-white font-semibold rounded px-1.5 py-0.5">${info.size}</span>
                                </div></div>
                                <div class="flex items-center gap-1.5 text-gray-400"><i data-lucide="user-check" class="w-3.5 h-3.5 flex-shrink-0"></i><span class="text-[11px] truncate">${info.seeders} seeders</span></div>
                                <div class="flex items-center gap-1.5 text-gray-400"><i data-lucide="package" class="w-3.5 h-3.5 flex-shrink-0"></i><span class="text-[11px] truncate">${info.source}</span></div>
                            </div>`;
                        streamItem.addEventListener('click', () => playStreamWithRealDebrid(stream, streamItem));
                        streamsList.appendChild(streamItem);
                        lucide.createIcons({nodes: [streamItem]});
                    });
                    const streamContainer = document.getElementById('streamsCarouselContainer');
                    const leftBtn = streamContainer.querySelector('.scroll-btn.left');
                    const rightBtn = streamContainer.querySelector('.scroll-btn.right');
                    leftBtn.addEventListener('click', () => streamsList.scrollBy({ left: -streamsList.offsetWidth * 0.9, behavior: 'smooth' }));
                    rightBtn.addEventListener('click', () => streamsList.scrollBy({ left: streamsList.offsetWidth * 0.9, behavior: 'smooth' }));
                    lucide.createIcons({ nodes: [leftBtn, rightBtn] });
                } else {
                    closeModal();
                    displayError('No available streams were found for this title.');
                }
            } catch (error) {
                console.error("Stream fetch error:", error);
                closeModal();
                displayError(`Could not fetch streams: ${error.message}`);
            }
        }
        
        async function loadStreamsForMedia(media) {
            openModal(playerModal);
            modalMovieTitle.textContent = media.title || media.name;
            player.poster(`${TMDB_IMAGE_BASE_POSTER}${media.poster_path}`);
            streamsList.innerHTML = `<p class="text-gray-400">Fetching movie details...</p>`;
            try {
                let imdbId;
                let mediaTypeForProvider = media.media_type === 'tv' ? 'series' : 'movie';
                
                if (media.media_type === 'movie') {
                    const detailsUrl = `${TMDB_API_BASE}/movie/${media.id}?api_key=${TMDB_API_KEY}`;
                    const response = await fetch(detailsUrl);
                    if (!response.ok) throw new Error("Could not fetch movie details.");
                    const data = await response.json();
                    imdbId = data.imdb_id;
                } else { // tv
                    const detailsUrl = `${TMDB_API_BASE}/tv/${media.id}/external_ids?api_key=${TMDB_API_KEY}`;
                    const response = await fetch(detailsUrl);
                    if (!response.ok) throw new Error("Could not fetch series details.");
                    const data = await response.json();
                    imdbId = data.imdb_id;
                }

                if (imdbId) {
                    await fetchAndDisplayStreams(imdbId, mediaTypeForProvider);
                } else {
                    throw new Error("IMDb ID not found for this content.");
                }
            } catch (error) {
                console.error("IMDb fetch error:", error);
                streamsList.innerHTML = `<p class="text-red-400">${error.message}</p>`;
            }
        }

        async function fetchCombinedAndDisplay(movieEndpoint, tvEndpoint, title) {
            try {
                const movieUrl = `${TMDB_API_BASE}/${movieEndpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
                const tvUrl = `${TMDB_API_BASE}/${tvEndpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

                const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl), fetch(tvUrl)]);
                if (!movieResponse.ok || !tvResponse.ok) throw new Error(`TMDB API Error`);

                const movieData = await movieResponse.json();
                const tvData = await tvResponse.json();

                const movies = movieData.results.map(m => ({...m, media_type: 'movie'}));
                const series = tvData.results.map(t => ({...t, media_type: 'tv'}));

                let combined = [...movies, ...series].sort((a, b) => b.popularity - a.popularity);

                if (combined.length > 0) createMovieRow(title, combined);
            } catch (error) {
                console.error(`Error fetching combined for ${title}:`, error);
                displayError(error.message);
            }
        }
        
        async function fetchAndDisplay(endpoint, title) {
            try {
                const url = `${TMDB_API_BASE}/${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`TMDB API Error: ${response.statusText}`);
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                     const contentResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

                     createMovieRow(title, contentResults);
                     
                     const heroItem = contentResults[0];
                     if (heroItem && heroItem.backdrop_path) {
                        heroSection.style.backgroundImage = `url('${TMDB_IMAGE_BASE_BACKDROP}${heroItem.backdrop_path}')`;
                        heroTitle.textContent = heroItem.title || heroItem.name;
                        heroOverview.textContent = heroItem.overview;
                     }
                }
            } catch (error) {
                console.error(`Error fetching ${title}:`, error);
                displayError(error.message);
            }
        }
        
        async function searchContent() {
            const query = searchInput.value.trim();
            if (!query) { displayError("Please enter a title."); return; }
            const existingSearchRow = document.getElementById('search-results-row');
            if(existingSearchRow) existingSearchRow.remove();
            
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'search-loading';
            loadingIndicator.innerHTML = `<h2 class="text-2xl font-bold mb-4">Searching...</h2>`;
            movieRowsContainer.prepend(loadingIndicator);
            try {
                const searchUrl = `${TMDB_API_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
                const response = await fetch(searchUrl);
                if (!response.ok) throw new Error(`TMDB API Error`);
                const data = await response.json();
                
                document.getElementById('search-loading')?.remove();
                
                const contentResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

                if (contentResults.length > 0) {
                    createMovieRow('Search Results', contentResults, 'search-results-row');
                } else {
                    displayError('No movies or series found for that query.');
                }
            } catch (error) {
                console.error("Search error:", error);
                displayError(error.message);
            }
        }
        function createMovieRow(title, mediaItems, rowId = '') {
            const rowWrapper = document.createElement('div');
            if (rowId) rowWrapper.id = rowId;
            rowWrapper.innerHTML = `
                <h2 class="text-2xl font-bold mb-4">${title}</h2>
                <div class="carousel-container relative">
                    <div class="movie-carousel flex overflow-x-auto space-x-4 pb-4"></div>
                    <button class="scroll-btn left"><i data-lucide="chevron-left" class="w-8 h-8"></i></button>
                    <button class="scroll-btn right"><i data-lucide="chevron-right" class="w-8 h-8"></i></button>
                </div>`;
            const carousel = rowWrapper.querySelector('.movie-carousel');
            mediaItems.forEach(media => {
                if (!media.poster_path) return;
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-56 xl:w-64 bg-gray-800 rounded-lg overflow-hidden cursor-pointer';
                movieCard.innerHTML = `<img src="${TMDB_IMAGE_BASE_POSTER}${media.poster_path}" alt="${media.title || media.name}" class="w-full h-auto">`;
                movieCard.addEventListener('click', () => loadStreamsForMedia(media));
                movieCard.addEventListener('mouseenter', () => debouncedUpdateHero(media));
                carousel.appendChild(movieCard);
            });
            const leftBtn = rowWrapper.querySelector('.scroll-btn.left');
            const rightBtn = rowWrapper.querySelector('.scroll-btn.right');
            leftBtn.addEventListener('click', () => carousel.scrollBy({ left: -carousel.offsetWidth * 0.9, behavior: 'smooth' }));
            rightBtn.addEventListener('click', () => carousel.scrollBy({ left: carousel.offsetWidth * 0.9, behavior: 'smooth' }));
            lucide.createIcons({ nodes: [leftBtn, rightBtn] });
            if(rowId === 'search-results-row'){ movieRowsContainer.prepend(rowWrapper); } 
            else { movieRowsContainer.appendChild(rowWrapper); }
        }

        // --- UTILITY AND HELPER FUNCTIONS ---

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        function updateHero(media) {
            if (media && media.backdrop_path) {
                heroSection.style.backgroundImage = `url('${TMDB_IMAGE_BASE_BACKDROP}${media.backdrop_path}')`;
                heroTitle.textContent = media.title || media.name;
                heroOverview.textContent = media.overview;
            }
        }

        const debouncedUpdateHero = debounce(updateHero, 300);

        function parseStreamInfo(stream) {
            const lines = stream.title.split('\n');
            const fileName = lines[0];
            const sizeMatch = lines[1] ? lines[1].match(/💾\s*([\d.]+\s*\w+)/) : null;
            const seedersMatch = lines[2] ? lines[2].match(/👤\s*(\d+)/) : null;
            const source = lines[3] || 'Unknown';
            const qualityMatch = fileName.match(/(\d{3,4}p|4k|2160p|720p)/i);
            return {
                fileName: fileName,
                quality: qualityMatch ? qualityMatch[0].toUpperCase().replace('P','p') : '',
                size: sizeMatch ? sizeMatch[1] : 'N/A',
                seeders: seedersMatch ? seedersMatch[1] : 'N/A',
                source: source,
                infoHash: stream.infoHash
            };
        }
        function openModal(modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        function closeModal() {
            player.pause();
            player.reset();
            playerModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        function displayError(message) { 
            errorMessage.textContent = message;
            setTimeout(() => errorMessage.textContent = '', 5000);
        }

        // --- INITIALIZATION ---
        function initializeApp() {
             if (!TMDB_API_KEY) { displayError("CRITICAL: TMDB API Key not set."); return; }
             if (!RD_API_KEY) { displayError("CRITICAL: Real-Debrid API Key not set."); return; }
            fetchAndDisplay('trending/all/week', 'Trending Movies & Series');
            fetchCombinedAndDisplay('movie/popular', 'tv/popular', 'Popular Movies & Series');
            fetchCombinedAndDisplay('movie/now_playing', 'tv/on_the_air', 'Newest Movies & Series');
        }

        initializeApp();
    </script>
</body>
</html>

