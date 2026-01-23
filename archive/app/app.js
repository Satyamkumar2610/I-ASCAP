let districtData = { states: [], records: [] };
let currentState = '';
let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    registerServiceWorker();
});

async function loadData() {
    try {
        const response = await fetch('data.json');
        districtData = await response.json();
        populateStateDropdown();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function populateStateDropdown() {
    const select = document.getElementById('state-select');
    districtData.states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        select.appendChild(option);
    });
}

function setupEventListeners() {
    const stateSelect = document.getElementById('state-select');
    const districtSearch = document.getElementById('district-search');
    const installBtn = document.getElementById('install-btn');

    stateSelect.addEventListener('change', (e) => {
        currentState = e.target.value;
        districtSearch.disabled = !currentState;
        districtSearch.value = '';
        if (currentState) {
            displayResults(currentState, '');
        } else {
            showEmptyState();
        }
    });

    districtSearch.addEventListener('input', (e) => {
        if (currentState) {
            displayResults(currentState, e.target.value);
        }
    });

    // Handle "Expand" link for the graph
    document.getElementById('link-expand')?.addEventListener('click', (e) => {
        const img = document.getElementById('img-lineage');
        if (img.src && !img.src.endsWith('/')) {
            e.preventDefault();
            window.open(img.src, '_blank');
        }
    });

    // PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
    });

    installBtn?.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installBtn.style.display = 'none';
            }
            deferredPrompt = null;
        }
    });
}

function displayResults(state, searchTerm) {
    const records = districtData.records.filter(r => r.state === state);
    let filteredRecords = records;

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredRecords = records.filter(r =>
            r.source.toLowerCase().includes(term) ||
            r.dest.toLowerCase().includes(term)
        );
    }

    updateStats(filteredRecords);
    renderTable(filteredRecords, searchTerm);
    updateVisualizations(state);
    updateHeader(state, filteredRecords);

    // Show Dashboard, Hide Empty State
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';
}

function updateHeader(state, records) {
    document.getElementById('display-state-name').textContent = state;
    document.getElementById('record-count').textContent = `${records.length} Records found`;

    // Calculate year range for header if needed
    let minYear = Infinity;
    let maxYear = -Infinity;
    records.forEach(r => {
        if (r.sourceYear > 0) minYear = Math.min(minYear, r.sourceYear);
        if (r.destYear > 0) maxYear = Math.max(maxYear, r.destYear);
    });

    const rangeText = (minYear !== Infinity && maxYear !== -Infinity)
        ? `Data Range: ${minYear} - ${maxYear}`
        : 'Data Range: 1951 - 2024';

    document.getElementById('display-range').textContent = rangeText;
}

function updateVisualizations(state) {
    const formattedState = state.replace(/ /g, '_');

    // Update Image
    const imgPath = `assets/graphs/${formattedState}_lineage.png`;
    const img = document.getElementById('img-lineage');

    // Handle image error
    img.onerror = () => {
        img.src = '';
        img.alt = 'Graph not available';
        // Could hide or show placeholder
    };
    img.src = imgPath;

    // Update Links
    const timelinePath = `assets/interactive/${formattedState}_Timeline.html`;
    const networkPath = `assets/interactive/${formattedState}_interactive.html`;

    document.getElementById('link-timeline').href = timelinePath;
    document.getElementById('link-network').href = networkPath;
}

function updateStats(records) {
    const uniqueDistricts = new Set();
    let minYear = Infinity;
    let maxYear = -Infinity;

    records.forEach(r => {
        uniqueDistricts.add(r.source);
        uniqueDistricts.add(r.dest);
        if (r.sourceYear > 0) minYear = Math.min(minYear, r.sourceYear);
        if (r.destYear > 0) maxYear = Math.max(maxYear, r.destYear);
    });

    document.getElementById('stat-changes').textContent = records.length;
    document.getElementById('stat-districts').textContent = uniqueDistricts.size;
    document.getElementById('stat-period').textContent =
        (minYear !== Infinity && maxYear !== -Infinity) ? `${minYear}-${maxYear}` : '--';
}

function renderTable(records, searchTerm) {
    const tbody = document.getElementById('table-body');

    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 32px; color: var(--text-muted);">
                    No matching records found
                </td>
            </tr>
        `;
        return;
    }

    const sortedRecords = [...records].sort((a, b) => a.sourceYear - b.sourceYear);

    tbody.innerHTML = sortedRecords.map(record => `
        <tr>
            <td>${highlightText(record.source, searchTerm)}</td>
            <td>${highlightText(record.dest, searchTerm)}</td>
            <td>
                <span class="badge-year">${record.destYear}</span>
            </td>
        </tr>
    `).join('');
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    // Simple bold highlight
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<strong style="color:var(--primary);">$1</strong>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showEmptyState() {
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('dashboard-content').style.display = 'none';
}

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('sw.js');
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }
}
