
import React, { useState, useEffect, useRef } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import './NetworkBanner.css';

export function NetworkBanner() {
    const isOnline = useNetworkStatus();
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [status, setStatus] = useState('online');
    const wasOfflineRef = useRef(false);

    useEffect(() => {
        if (!isOnline) {
            wasOfflineRef.current = true;
            setStatus('offline');
            setShouldRender(true);

            const frame = requestAnimationFrame(() => {
                setIsVisible(true);
            });
            return () => cancelAnimationFrame(frame);
        }

        if (isOnline && wasOfflineRef.current) {
            setStatus('online');
            setShouldRender(true);
            setIsVisible(true);

            const hideTimer = setTimeout(() => {
                setIsVisible(false);
            }, 3500);

            const unmountTimer = setTimeout(() => {
                setShouldRender(false);
                wasOfflineRef.current = false;
            }, 3850);

            return () => {
                clearTimeout(hideTimer);
                clearTimeout(unmountTimer);
            };
        }
    }, [isOnline]);

    if (!shouldRender) return null;

    return (
        <div
            className={`network-banner-wrapper ${isVisible ? 'is-visible' : ''}`}
            role="status"
            aria-live="polite"
        >
            <div className={`network-banner ${status}`}>
                <span className="network-status-dot" />
                <span>
                    {status === 'offline'
                        ? 'No internet connection. Please check your network.'
                        : 'You are back online. Connection restored.'}
                </span>
            </div>
        </div>
    );
}