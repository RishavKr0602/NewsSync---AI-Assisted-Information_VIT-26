import React from 'react';
import { RotateCw } from 'lucide-react';

export default function ViewTabs({ currentView, onViewChange, onRefresh, isRefreshing }) {
    return (
        <div className="view-tabs">
            <button
                className={`tab ${currentView === 'latest' ? 'active' : ''}`}
                onClick={() => onViewChange('latest')}
            >
                Latest
            </button>
            <button
                className={`tab ${currentView === 'forYou' ? 'active' : ''}`}
                onClick={() => onViewChange('forYou')}
            >
                For You
            </button>
            <button
                className={`tab ${currentView === 'saved' ? 'active' : ''}`}
                onClick={() => onViewChange('saved')}
            >
                Saved
            </button>

            <button
                className={`tab tab-refresh ${isRefreshing ? 'refreshing' : ''}`}
                onClick={onRefresh}
                title="Refresh current feed"
                disabled={isRefreshing}
            >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'spin-icon' : ''}`} />
                <span>Refresh</span>
            </button>
        </div>
    );
}
