# Share Button Component

A reusable share button component that provides Web Share API functionality with automatic clipboard fallback for browsers that don't support native sharing.

## Features

- ✅ **Web Share API**: Native share dialog on supported devices (mobile, some desktop browsers)
- ✅ **Clipboard Fallback**: Automatically copies link to clipboard on unsupported browsers
- ✅ **Toast Notifications**: Beautiful success/error notifications
- ✅ **Button Feedback**: Visual feedback when link is copied
- ✅ **Zero Dependencies**: Pure vanilla JavaScript
- ✅ **Easy Integration**: Just include the script and call one function

## Quick Start

### 1. Include the Script

Add the script tag to your HTML file:

```html
<script src="../shared-components/share-button.js"></script>
```

### 2. Add the Share Button

Add a button with the ID `share-tool-button` (or a custom ID):

```html
<button id="share-tool-button">
    📤 Share
</button>
```

### 3. Initialize the Component

Call `initShareButton()` when the DOM is loaded:

```html
<script>
    window.addEventListener('DOMContentLoaded', () => {
        initShareButton({
            title: 'Your Tool Name | LiDa Software',
            text: 'Check out this free developer tool from LiDa Software!'
        });
    });
</script>
```

## Configuration Options

The `initShareButton()` function accepts an optional configuration object:

```javascript
initShareButton({
    buttonId: 'share-tool-button',  // ID of the share button (default: 'share-tool-button')
    title: 'Custom Title',           // Title for sharing (default: document.title)
    text: 'Custom description',      // Description text (default: 'Check out this free developer tool from LiDa Software!')
    url: 'https://example.com'       // URL to share (default: window.location.href)
});
```

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Tool | LiDa Software</title>
    <script src="../shared-components/share-button.js"></script>
</head>
<body>
    <header>
        <h1>My Awesome Tool</h1>
        <button 
            id="share-tool-button"
            style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
            "
        >
            📤 Share
        </button>
    </header>

    <script>
        window.addEventListener('DOMContentLoaded', () => {
            initShareButton({
                title: 'My Awesome Tool | LiDa Software',
                text: 'Check out this amazing free tool from LiDa Software!'
            });
        });
    </script>
</body>
</html>
```

## Styling Examples

### Minimal Button
```html
<button id="share-tool-button" class="share-btn">
    📤 Share
</button>

<style>
.share-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}
</style>
```

### Gradient Button (Recommended)
```html
<button id="share-tool-button" class="share-btn-gradient">
    📤 Share this tool
</button>

<style>
.share-btn-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
}

.share-btn-gradient:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}
</style>
```

### Icon-Only Button
```html
<button id="share-tool-button" class="share-btn-icon" title="Share this tool">
    📤
</button>

<style>
.share-btn-icon {
    background: #667eea;
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
```

## Browser Support

- **Web Share API**: Mobile browsers (iOS Safari, Chrome Android), some desktop browsers
- **Clipboard API**: All modern browsers (Chrome 63+, Firefox 53+, Safari 13.1+, Edge 79+)
- **Fallback**: Works in all browsers via `document.execCommand('copy')`

## How It Works

1. **User clicks the share button**
2. **Check if Web Share API is available**
   - If YES: Open native share dialog
   - If NO: Copy link to clipboard
3. **Show feedback**
   - Toast notification appears
   - Button shows "✓ Copied!" temporarily

## Customization

### Custom Button ID

If you want to use a different button ID:

```javascript
initShareButton({
    buttonId: 'my-custom-share-btn'
});
```

### Custom Share Data

Customize what gets shared:

```javascript
initShareButton({
    title: 'Amazing JSON Formatter',
    text: 'Format your JSON with this free tool!',
    url: 'https://example.com/json-formatter'
});
```

### Multiple Share Buttons

You can have multiple share buttons on the same page:

```javascript
// First button
initShareButton({
    buttonId: 'share-btn-1',
    title: 'Tool 1'
});

// Second button
initShareButton({
    buttonId: 'share-btn-2',
    title: 'Tool 2'
});
```

## Troubleshooting

### Button doesn't work
- Make sure the script is loaded before calling `initShareButton()`
- Check that the button ID matches the one in your configuration
- Open browser console to see any error messages

### Toast doesn't appear
- The toast is positioned at `top: 20px; right: 20px`
- Make sure no other elements have a higher z-index
- Check if the toast container is being created in the DOM

### Clipboard doesn't work
- Clipboard API requires HTTPS (except on localhost)
- Some browsers require user interaction (button click)
- The fallback using `execCommand` should work in older browsers

## Examples in This Project

See these files for real-world implementations:

- `tools/jsonToZod/json-to-zod-converter.html`
- `tools/timeStampConvert/time-stamp-convert.html`

## License

Free to use in all LiDa Software tools.
