// ===== Global State =====
let currentTimestamp = null;
let countdownInterval = null;
let relativeTimeInterval = null;
let batchFormats = ['iso', 'locale', 'relative'];

// ===== Initialize on Page Load =====
document.addEventListener('DOMContentLoaded', () => {
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const ts = urlParams.get('ts');
    if (ts) {
        document.getElementById('timestamp-input').value = ts;
    } else {
        // Clear timestamp input to start fresh
        document.getElementById('timestamp-input').value = '';
    }
    
    // Clear date input
    document.getElementById('date-input').value = '';
    
    // Generate API examples
    generateApiExamples();
    
    // Add event listeners
    document.getElementById('timestamp-input').addEventListener('input', updateOutput);
    document.getElementById('date-input').addEventListener('change', handleDateInput);
});

// ===== Main Conversion Functions =====
function insertNow() {
    const now = Date.now();
    document.getElementById('timestamp-input').value = now;
    updateOutput();
}

function insertPreset(type) {
    const now = new Date();
    let timestamp;
    
    switch (type) {
        case 'today':
            now.setHours(0, 0, 0, 0);
            timestamp = now.getTime();
            break;
        case 'yesterday':
            now.setDate(now.getDate() - 1);
            now.setHours(0, 0, 0, 0);
            timestamp = now.getTime();
            break;
        case 'tomorrow':
            now.setDate(now.getDate() + 1);
            now.setHours(0, 0, 0, 0);
            timestamp = now.getTime();
            break;
        default:
            timestamp = Date.now();
    }
    
    document.getElementById('timestamp-input').value = timestamp;
    updateOutput();
}

function handleDateInput() {
    const dateInput = document.getElementById('date-input').value;
    if (dateInput) {
        const date = new Date(dateInput);
        const timestamp = date.getTime();
        document.getElementById('timestamp-input').value = timestamp;
        updateOutput();
    }
}

function parseTimestamp(input) {
    if (!input || input.trim() === '') {
        return null;
    }
    
    const trimmed = input.trim();
    
    // Try parsing as number first
    const num = Number(trimmed);
    if (!isNaN(num) && num > 0) {
        // Auto-detect format based on length
        if (trimmed.length <= 10) {
            return num * 1000; // seconds to milliseconds
        } else if (trimmed.length <= 13) {
            return num; // milliseconds
        } else if (trimmed.length > 13) {
            return num / 1000000; // nanoseconds to milliseconds
        }
    }
    
    // Try parsing as date string
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
        return date.getTime();
    }
    
    return null;
}

function updateOutput() {
    const input = document.getElementById('timestamp-input').value;
    const timestamp = parseTimestamp(input);
    
    if (!timestamp) {
        document.getElementById('output-grid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">Enter a valid timestamp to see results</div>';
        document.getElementById('countdown').classList.remove('active');
        document.getElementById('relative-time').classList.remove('active');
        stopIntervals();
        return;
    }
    
    currentTimestamp = timestamp;
    const selectedTimezone = document.getElementById('timezone-select').value;
    const date = new Date(timestamp);
    
    // Prepare formats with timezone support
    const formats = [
        { 
            label: 'Unix Seconds', 
            value: Math.floor(timestamp / 1000).toString() 
        },
        { 
            label: 'Unix Milliseconds', 
            value: timestamp.toString() 
        },
        { 
            label: 'ISO 8601', 
            value: date.toISOString() 
        },
        { 
            label: 'Locale String', 
            value: formatTimezoneString(date, selectedTimezone, 'full')
        },
        { 
            label: 'UTC String', 
            value: date.toUTCString() 
        },
        { 
            label: 'Date Only', 
            value: formatTimezoneString(date, selectedTimezone, 'date')
        },
        { 
            label: 'Time Only', 
            value: formatTimezoneString(date, selectedTimezone, 'time')
        },
        { 
            label: 'YYYY-MM-DD', 
            value: formatTimezoneString(date, selectedTimezone, 'ymd')
        }
    ];
    
    // Render output grid
    const outputGrid = document.getElementById('output-grid');
    outputGrid.innerHTML = formats.map(format => `
        <div class="output-item">
            <div class="output-label">${format.label}</div>
            <div class="output-value">
                <span class="output-text">${escapeHtml(format.value)}</span>
                <button class="copy-btn" onclick="copyToClipboard('${escapeForAttr(format.value)}', this)">Copy</button>
            </div>
        </div>
    `).join('');
    
    // Update countdown or relative time
    const now = Date.now();
    if (timestamp > now) {
        startCountdown(timestamp);
        document.getElementById('relative-time').classList.remove('active');
    } else {
        document.getElementById('countdown').classList.remove('active');
        updateRelativeTime(timestamp);
    }
}

function formatTimezoneString(date, timezone, format) {
    try {
        if (timezone === 'local') {
            // Use browser's local timezone
            switch (format) {
                case 'full':
                    return date.toLocaleString();
                case 'date':
                    return date.toLocaleDateString();
                case 'time':
                    return date.toLocaleTimeString();
                case 'ymd':
                    return formatYYYYMMDD(date);
                default:
                    return date.toLocaleString();
            }
        } else {
            // Use specified timezone with Intl API
            const options = { timeZone: timezone };
            
            switch (format) {
                case 'full':
                    return date.toLocaleString('en-US', { 
                        ...options, 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit',
                        hour12: false
                    });
                case 'date':
                    return date.toLocaleDateString('en-US', { 
                        ...options, 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit'
                    });
                case 'time':
                    return date.toLocaleTimeString('en-US', { 
                        ...options, 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit',
                        hour12: false
                    });
                case 'ymd':
                    const parts = new Intl.DateTimeFormat('en-US', {
                        ...options,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).formatToParts(date);
                    
                    const year = parts.find(p => p.type === 'year').value;
                    const month = parts.find(p => p.type === 'month').value;
                    const day = parts.find(p => p.type === 'day').value;
                    return `${year}-${month}-${day}`;
                default:
                    return date.toLocaleString('en-US', options);
            }
        }
    } catch (error) {
        console.error('Timezone formatting error:', error);
        // Fallback to local time
        return date.toLocaleString();
    }
}

function formatYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ===== Countdown & Relative Time =====
function startCountdown(targetTimestamp) {
    const countdownEl = document.getElementById('countdown');
    countdownEl.classList.add('active');
    
    function update() {
        const now = Date.now();
        const diff = targetTimestamp - now;
        
        if (diff <= 0) {
            countdownEl.textContent = '🎉 Time reached!';
            clearInterval(countdownInterval);
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownEl.textContent = `⏳ Countdown: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    
    if (countdownInterval) clearInterval(countdownInterval);
    update();
    countdownInterval = setInterval(update, 1000);
}

function updateRelativeTime(targetTimestamp) {
    const relativeEl = document.getElementById('relative-time');
    relativeEl.classList.add('active');
    
    function update() {
        const now = Date.now();
        const diff = now - targetTimestamp;
        const relativeText = getRelativeTime(diff);
        relativeEl.textContent = `⏰ ${relativeText}`;
    }
    
    if (relativeTimeInterval) clearInterval(relativeTimeInterval);
    update();
    relativeTimeInterval = setInterval(update, 1000);
}

function getRelativeTime(diff) {
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

function stopIntervals() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    if (relativeTimeInterval) {
        clearInterval(relativeTimeInterval);
        relativeTimeInterval = null;
    }
}

// ===== Batch Processing =====
function updateBatchFormats() {
    const checkboxes = document.querySelectorAll('.format-options input[type="checkbox"]');
    batchFormats = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
}

function processBatch() {
    const input = document.getElementById('batch-input').value;
    if (!input.trim()) {
        alert('Please enter some text with timestamps');
        return;
    }
    
    const lines = input.split('\n');
    let output = '';
    let foundCount = 0;
    
    lines.forEach((line, index) => {
        // Extract timestamps from line (unix seconds, milliseconds, or ISO dates)
        const timestampRegex = /\b\d{10,13}\b/g;
        const isoRegex = /\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?/g;
        
        const unixMatches = line.match(timestampRegex) || [];
        const isoMatches = line.match(isoRegex) || [];
        
        if (unixMatches.length > 0 || isoMatches.length > 0) {
            output += `Line ${index + 1}: ${line}\n`;
            
            unixMatches.forEach(match => {
                const timestamp = parseTimestamp(match);
                if (timestamp) {
                    output += formatBatchOutput(match, timestamp);
                    foundCount++;
                }
            });
            
            isoMatches.forEach(match => {
                const timestamp = parseTimestamp(match);
                if (timestamp) {
                    output += formatBatchOutput(match, timestamp);
                    foundCount++;
                }
            });
            
            output += '\n';
        }
    });
    
    if (foundCount === 0) {
        output = 'No timestamps found in the input text.\n\nTip: Make sure timestamps are in Unix format (e.g., 1734652800) or ISO format (e.g., 2024-12-20T00:00:00Z)';
    } else {
        output = `Found ${foundCount} timestamp${foundCount > 1 ? 's' : ''}:\n\n` + output;
    }
    
    const batchOutput = document.getElementById('batch-output');
    batchOutput.textContent = output;
    batchOutput.classList.add('active');
}

function formatBatchOutput(original, timestamp) {
    const date = new Date(timestamp);
    let output = `  ${original} →\n`;
    
    if (batchFormats.includes('iso')) {
        output += `    ISO: ${date.toISOString()}\n`;
    }
    if (batchFormats.includes('locale')) {
        output += `    Locale: ${date.toLocaleString()}\n`;
    }
    if (batchFormats.includes('relative')) {
        const diff = Date.now() - timestamp;
        output += `    Relative: ${diff > 0 ? getRelativeTime(diff) : 'in the future'}\n`;
    }
    
    return output;
}

function copyBatchOutput() {
    const text = document.getElementById('batch-output').textContent;
    if (text) {
        copyToClipboard(text);
    }
}

function clearBatch() {
    document.getElementById('batch-input').value = '';
    document.getElementById('batch-output').textContent = '';
    document.getElementById('batch-output').classList.remove('active');
}

// ===== Timestamp Math =====
function calculateDifference() {
    const ts1 = document.getElementById('math-ts1').value;
    const ts2 = document.getElementById('math-ts2').value;
    
    if (!ts1) {
        alert('Please enter at least Timestamp 1');
        return;
    }
    
    const time1 = parseTimestamp(ts1);
    const time2 = ts2 ? parseTimestamp(ts2) : Date.now();
    
    if (!time1 || !time2) {
        alert('Invalid timestamp format');
        return;
    }
    
    const diff = Math.abs(time1 - time2);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const milliseconds = diff % 1000;
    
    const date1 = new Date(time1);
    const date2 = new Date(time2);
    
    const result = document.getElementById('math-result');
    result.innerHTML = `
        <strong>📊 Time Difference:</strong><br>
        ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds, ${milliseconds} ms<br>
        <br>
        <strong>Total:</strong><br>
        ${diff} milliseconds<br>
        ${Math.floor(diff / 1000)} seconds<br>
        ${Math.floor(diff / 60000)} minutes<br>
        ${Math.floor(diff / 3600000)} hours<br>
        <br>
        <strong>Timestamps:</strong><br>
        Start: ${date1.toLocaleString()}<br>
        End: ${date2.toLocaleString()}
    `;
    result.classList.add('active');
}

function addTime(ms) {
    const ts1 = document.getElementById('math-ts1').value;
    
    if (!ts1) {
        alert('Please enter Timestamp 1');
        return;
    }
    
    const time = parseTimestamp(ts1);
    if (!time) {
        alert('Invalid timestamp format');
        return;
    }
    
    const newTime = time + ms;
    const date = new Date(newTime);
    
    document.getElementById('math-ts1').value = newTime;
    
    const result = document.getElementById('math-result');
    const operation = ms > 0 ? 'Added' : 'Subtracted';
    const amount = Math.abs(ms);
    
    result.innerHTML = `
        <strong>✨ ${operation} Time:</strong><br>
        ${formatMilliseconds(amount)}<br>
        <br>
        <strong>New Timestamp:</strong><br>
        ${newTime} (milliseconds)<br>
        ${Math.floor(newTime / 1000)} (seconds)<br>
        <br>
        <strong>Date:</strong><br>
        ${date.toLocaleString()}<br>
        ${date.toISOString()}
    `;
    result.classList.add('active');
}

function formatMilliseconds(ms) {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    
    return parts.join(', ') || '0 minutes';
}

// ===== API Examples =====
function generateApiExamples() {
    const examples = [
        { lang: 'JavaScript', code: 'Date.now()' },
        { lang: 'JavaScript', code: 'Math.floor(Date.now() / 1000)' },
        { lang: 'Python', code: 'import time; int(time.time() * 1000)' },
        { lang: 'Java', code: 'System.currentTimeMillis()' },
        { lang: 'C#', code: 'DateTimeOffset.Now.ToUnixTimeMilliseconds()' },
        { lang: 'PHP', code: 'round(microtime(true) * 1000)' },
        { lang: 'Go', code: 'time.Now().UnixMilli()' },
        { lang: 'Ruby', code: '(Time.now.to_f * 1000).to_i' },
        { lang: 'Rust', code: 'SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis()' }
    ];
    
    const container = document.getElementById('api-examples');
    container.innerHTML = examples.map(ex => `
        <div class="api-example">
            <div>
                <span class="api-lang">${ex.lang}:</span>
                <span class="api-code">${escapeHtml(ex.code)}</span>
            </div>
            <button class="copy-btn" onclick="copyToClipboard('${escapeForAttr(ex.code)}', this)">Copy</button>
        </div>
    `).join('');
}

// ===== Collapsible Sections =====
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    const toggle = content.previousElementSibling;
    
    content.classList.toggle('active');
    toggle.classList.toggle('active');
}

// ===== Utility Functions =====
function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        if (buttonElement) {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = 'Copied!';
            buttonElement.classList.add('copied');
            
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.classList.remove('copied');
            }, 1500);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeForAttr(text) {
    return String(text)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
}

// ===== Cleanup on page unload =====
window.addEventListener('beforeunload', () => {
    stopIntervals();
});
