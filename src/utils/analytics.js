/**
 * SimpleAnalytics event tracking utility
 * 
 * SimpleAnalytics events are simple strings (lowercase, alphanumeric, underscores only).
 * Metadata can be encoded in the event name or tracked as separate events.
 */

/**
 * Track a SimpleAnalytics event
 * @param {string} eventName - Event name (lowercase, underscores, alphanumeric)
 * @param {object} metadata - Optional metadata (will be encoded in event name if provided)
 */
export function trackEvent(eventName, metadata = null) {
  // Validate event name format
  if (!/^[a-z0-9_]+$/.test(eventName)) {
    console.warn(`Invalid event name format: ${eventName}. Use lowercase, underscores, and alphanumeric only.`);
    return;
  }

  // Check if sa_event is available
  if (typeof window.sa_event === 'function') {
    try {
      // If metadata provided, encode it in the event name
      let finalEventName = eventName;
      
      if (metadata && Object.keys(metadata).length > 0) {
        // Encode metadata as key_value pairs in event name
        const metadataStr = Object.entries(metadata)
          .map(([key, value]) => `${key}_${String(value).toLowerCase().replace(/[^a-z0-9]/g, '_')}`)
          .join('_');
        finalEventName = `${eventName}_${metadataStr}`;
        
        // Ensure event name doesn't exceed 200 characters (SimpleAnalytics limit)
        if (finalEventName.length > 200) {
          // Truncate metadata if needed
          const maxBaseLength = eventName.length + 1;
          const maxMetadataLength = 200 - maxBaseLength;
          const truncatedMetadata = metadataStr.substring(0, maxMetadataLength);
          finalEventName = `${eventName}_${truncatedMetadata}`;
        }
      }
      
      window.sa_event(finalEventName);
    } catch (error) {
      console.warn('Analytics event failed:', eventName, error);
    }
  } else {
    // Queue event if sa_event not loaded yet
    if (!window.sa_event) {
      window.sa_event = window.sa_event || function() {
        const a = [].slice.call(arguments);
        window.sa_event.q ? window.sa_event.q.push(a) : window.sa_event.q = [a];
      };
    }
    
    // Queue the event
    if (window.sa_event.q) {
      const metadataStr = metadata ? Object.entries(metadata)
        .map(([key, value]) => `${key}_${String(value).toLowerCase().replace(/[^a-z0-9]/g, '_')}`)
        .join('_') : '';
      const finalEventName = metadataStr ? `${eventName}_${metadataStr}` : eventName;
      window.sa_event.q.push([finalEventName]);
    }
  }
}

/**
 * Track event with simpler name (no metadata encoding)
 * Use this for events where metadata would make the name too long
 * @param {string} eventName - Simple event name
 */
export function trackSimpleEvent(eventName) {
  trackEvent(eventName);
}

/**
 * Throttle function for high-frequency events
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}
