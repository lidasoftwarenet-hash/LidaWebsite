/**
 * Share Button Component
 * Provides Web Share API functionality with clipboard fallback
 * Usage: Call initShareButton() after DOM is loaded
 */

(function() {
    'use strict';

    /**
     * Initialize the share button functionality
     * @param {Object} options - Configuration options
     * @param {string} options.buttonId - ID of the share button (default: 'share-tool-button')
     * @param {string} options.title - Custom title for sharing (default: document.title)
     * @param {string} options.text - Custom text for sharing (default: 'Check out this free developer tool from LiDa Software!')
     * @param {string} options.url - Custom URL for sharing (default: window.location.href)
     */
    window.initShareButton = function(options = {}) {
        const config = {
            buttonId: options.buttonId || 'share-tool-button',
            title: options.title || document.title,
            text: options.text || 'Check out this free developer tool from LiDa Software!',
            url: options.url || window.location.href
        };

        const shareButton = document.getElementById(config.buttonId);
        
        if (!shareButton) {
            console.warn(`Share button with id "${config.buttonId}" not found`);
            return;
        }

        shareButton.addEventListener('click', async function() {
            const shareData = {
                title: config.title,
                text: config.text,
                url: config.url
            };

            // Check if Web Share API is supported
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    console.log('Content shared successfully');
                } catch (err) {
                    // User canceled or share failed
                    if (err.name !== 'AbortError') {
                        console.log('Share failed:', err);
                        fallbackCopyToClipboard(config.url, shareButton);
                    }
                }
            } else {
                // Fallback to clipboard
                fallbackCopyToClipboard(config.url, shareButton);
            }
        });
    };

    /**
     * Fallback function to copy URL to clipboard
     * @param {string} url - URL to copy
     * @param {HTMLElement} button - Button element for feedback
     */
    function fallbackCopyToClipboard(url, button) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(() => {
                    showToast('Link copied to clipboard!', 'success');
                    showButtonFeedback(button, '✓ Copied!');
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    showToast('Failed to copy link', 'error');
                });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                showToast('Link copied to clipboard!', 'success');
                showButtonFeedback(button, '✓ Copied!');
            } catch (err) {
                console.error('Failed to copy:', err);
                showToast('Failed to copy link', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }

    /**
     * Show temporary feedback on the button
     * @param {HTMLElement} button - Button element
     * @param {string} message - Feedback message
     */
    function showButtonFeedback(button, message) {
        const originalText = button.innerHTML;
        button.innerHTML = message;
        button.style.pointerEvents = 'none';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.pointerEvents = 'auto';
        }, 2000);
    }

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type ('success' or 'error')
     */
    function showToast(message, type = 'success') {
        // Check if toast container exists, create if not
        let toastContainer = document.getElementById('share-toast-container');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'share-toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `share-toast share-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-size: 14px;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
            pointer-events: auto;
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
            // Remove container if empty
            if (toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 3000);
    }

    // Add CSS animations
    if (!document.getElementById('share-button-styles')) {
        const style = document.createElement('style');
        style.id = 'share-button-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
})();
