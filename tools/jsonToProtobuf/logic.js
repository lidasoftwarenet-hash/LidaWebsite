/**
 * ProtoStruct PRO - Main Entry Point
 * Modular JSON-to-Protobuf Converter
 * Built by LiDa Software
 */

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        new UIController();
    } catch (error) {
        console.error('Failed to initialize ProtoStruct:', error);
    }
});