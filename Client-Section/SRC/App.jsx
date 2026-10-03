import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ViewTabs from './components/ViewTabs';
import Controls from './components/Controls';
import AINote from './components/AINote';
import ArticleCard from './components/ArticleCard';
import ReaderModal from './components/ReaderModal';
import StateMessage from './components/StateMessage';
import {
    fetchNews,
    fetchRecommendations,
    fetchSavedArticles,
    saveArticle,
    removeSavedArticle,
    aiDailyBrief,
    getArticleId
} from './services/api';

export default function App() {
    const [currentView, setCurrentView] = useState('latest');

    const [articles, setArticles] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [savedArticles, setSavedArticles] = useState([]);
    const [savedArticleIds, setSavedArticleIds] = useState(new Set());

    const [filterParams, setFilterParams] = useState({ search: '', category: '', country: '', language: '' });

    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [aiContent, setAiContent] = useState(null);

    // Modal state for Immersive Reader View
    const [modalIndex, setModalIndex] = useState(-1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial load: fetch saved articles ID map
    const loadSavedArticlesList = useCallback(async () => {
        try {
            const list = await fetchSavedArticles();
            setSavedArticles(list);
            setSavedArticleIds(new Set(list.map((a) => getArticleId(a))));
            return list;
        } catch (err) {
            console.error('Failed to load saved articles:', err);
            return [];
        }
    }, []);

    const loadLatestNews = useCallback(async (params = filterParams, isBgRefresh = false) => {
        if (!isBgRefresh) {
            setIsLoading(true);
            setError(null);
        } else {
            setIsRefreshing(true);
        }

        try {
            const news = await fetchNews(params);
            setArticles(news);
        } catch (err) {
            console.error('loadLatestNews error:', err);
            if (!isBgRefresh) {
                setError(`Failed to fetch news (${err.message || 'Network Error'}). Make sure your server is running on port 5000.`);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [filterParams]);

    const loadForYouNews = useCallback(async (isBgRefresh = false) => {
        if (!isBgRefresh) {
            setIsLoading(true);
            setError(null);
        } else {
            setIsRefreshing(true);
        }

        try {
            const recs = await fetchRecommendations();
            setRecommendations(recs);
        } catch (err) {
            console.error('loadForYouNews error:', err);
            if (!isBgRefresh) {
                setError(`Failed to load recommendations (${err.message || 'Network Error'}).`);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    const loadSavedTab = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const list = await loadSavedArticlesList();
            if (list.length === 0) {
                setError("You haven't saved any articles yet.<br>Click Save on any article card to bookmark it here.");
            }
        } catch (err) {
            setError('Failed to load saved articles.');
        } finally {
            setIsLoading(false);
        }
    }, [loadSavedArticlesList]);

    useEffect(() => {
        loadSavedArticlesList();
        loadLatestNews();
    }, [loadSavedArticlesList, loadLatestNews]);

    const handleViewChange = (view) => {
        setCurrentView(view);
        setError(null);

        if (view === 'latest' && articles.length === 0) {
            loadLatestNews();
        } else if (view === 'forYou' && recommendations.length === 0) {
            loadForYouNews();
        } else if (view === 'saved') {
            loadSavedTab();
        }
    };

    const handleRefresh = () => {
        if (currentView === 'latest') loadLatestNews(filterParams, true);
        else if (currentView === 'forYou') loadForYouNews(true);
        else if (currentView === 'saved') loadSavedTab();
    };

    const handleSearch = (searchTerm) => {
        const newParams = { ...filterParams, search: searchTerm };
        setFilterParams(newParams);
        setCurrentView('latest');
        loadLatestNews(newParams);
    };

    const handleFilter = (filters) => {
        const newParams = { ...filterParams, ...filters };
        setFilterParams(newParams);
        setCurrentView('latest');
        loadLatestNews(newParams);
    };

    const handleDailyBrief = async () => {
        let currentArticlesList = articles;
        if (currentView === 'saved' && savedArticles.length > 0) {
            currentArticlesList = savedArticles;
        } else if (currentArticlesList.length === 0) {
            currentArticlesList = savedArticles;
        }

        if (!currentArticlesList || currentArticlesList.length === 0) {
            alert('Load some news first.');
            return;
        }

        try {
            setAiContent('Generating Daily Brief...');
            const brief = await aiDailyBrief(currentArticlesList);
            setAiContent(brief);
        } catch (err) {
            setAiContent(`**Error:** ${err.message}`);
        }
    };

    const handleSaveToggle = async (article) => {
        const id = getArticleId(article);
        if (!id) return;

        const isCurrentlySaved = savedArticleIds.has(id);

        if (isCurrentlySaved) {
            await removeSavedArticle(id);
            setSavedArticleIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            setSavedArticles((prev) => prev.filter((a) => getArticleId(a) !== id));
        } else {
            await saveArticle(article);
            setSavedArticleIds((prev) => new Set(prev).add(id));
            setSavedArticles((prev) => [article, ...prev]);
        }
    };

    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const handleLoadMore = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            setPage(nextPage);

            if (currentView === 'latest') {
                const more = await fetchNews({ ...filterParams, page: nextPage });
                if (more && more.length > 0) {
                    setArticles((prev) => {
                        const existingIds = new Set(prev.map((a) => getArticleId(a)).filter(Boolean));
                        const existingTitles = new Set(prev.map((a) => (a.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)));
                        const newUnique = more.filter((a) => {
                            const id = getArticleId(a);
                            const normTitle = (a.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
                            if (id && existingIds.has(id)) return false;
                            if (normTitle && existingTitles.has(normTitle)) return false;
                            return true;
                        });
                        return [...prev, ...newUnique];
                    });
                }
            } else if (currentView === 'forYou') {
                const moreRecs = await fetchRecommendations();
                if (moreRecs && moreRecs.length > 0) {
                    setRecommendations((prev) => {
                        const existingIds = new Set(prev.map((a) => getArticleId(a)).filter(Boolean));
                        const existingTitles = new Set(prev.map((a) => (a.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)));
                        const newUnique = moreRecs.filter((a) => {
                            const id = getArticleId(a);
                            const normTitle = (a.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
                            if (id && existingIds.has(id)) return false;
                            if (normTitle && existingTitles.has(normTitle)) return false;
                            return true;
                        });
                        return [...prev, ...newUnique];
                    });
                }
            }
        } catch (err) {
            console.error('Failed to load more news:', err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const activeArticles =
        currentView === 'latest'
            ? articles
            : currentView === 'forYou'
                ? recommendations
                : savedArticles;

    const handleModalNavigate = (direction) => {
        if (!activeArticles || activeArticles.length === 0) return;
        let nextIndex = modalIndex + direction;

        if (nextIndex >= activeArticles.length) {
            if (currentView !== 'saved') {
                const prevLength = activeArticles.length;
                handleLoadMore().then(() => {
                    setModalIndex(prevLength);
                });
            }
            return;
        }

        if (nextIndex < 0) nextIndex = activeArticles.length - 1;
        setModalIndex(nextIndex);
    };

    const currentModalArticle = activeArticles[modalIndex] || null;
    const nextModalArticle = activeArticles[modalIndex + 1] || null;
    const currentModalArticleId = currentModalArticle ? getArticleId(currentModalArticle) : null;

    return (
        <div>
            <Header />

            <main className="container">
                <ViewTabs
                    currentView={currentView}
                    onViewChange={handleViewChange}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                />

                {currentView === 'latest' && (
                    <Controls
                        onSearch={handleSearch}
                        onFilter={handleFilter}
                        onDailyBrief={handleDailyBrief}
                    />
                )}

                {isLoading && (
                    <div className="loader">
                        <span className="loader-dot" />
                        Fetching the latest
                    </div>
                )}

                <AINote content={aiContent} onClose={() => setAiContent(null)} />

                {!isLoading && error && (
                    <StateMessage
                        message={error}
                        isError={currentView !== 'saved' || savedArticles.length === 0}
                        onRetry={currentView === 'latest' ? () => loadLatestNews() : null}
                    />
                )}

                {!isLoading && !error && activeArticles.length === 0 && (
                    <div className="news-grid">
                        <p className="empty-state">No news found</p>
                    </div>
                )}

                {!isLoading && activeArticles.length > 0 && (
                    <>
                        <section className="news-grid">
                            {activeArticles.map((article, idx) => {
                                const id = getArticleId(article) || `art-${idx}`;
                                return (
                                    <ArticleCard
                                        key={id}
                                        article={article}
                                        index={idx}
                                        isSaved={savedArticleIds.has(id)}
                                        onSaveToggle={handleSaveToggle}
                                        onShowAI={(text) => setAiContent(text)}
                                        currentView={currentView}
                                        onOpenModal={(i) => {
                                            setModalIndex(i);
                                            setIsModalOpen(true);
                                        }}
                                    />
                                );
                            })}
                        </section>

                        {currentView !== 'saved' && (
                            <div className="load-more-feed-container">
                                <button
                                    className="btn btn-outline load-more-feed-btn"
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? 'Loading More Articles...' : 'Load More Articles'}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Immersive Reader Modal */}
                <ReaderModal
                    article={currentModalArticle}
                    nextArticle={nextModalArticle}
                    index={modalIndex}
                    total={activeArticles.length}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onNavigate={handleModalNavigate}
                    isSaved={currentModalArticleId ? savedArticleIds.has(currentModalArticleId) : false}
                    onSaveToggle={handleSaveToggle}
                    onLoadMore={handleLoadMore}
                    isLoadingMore={isLoadingMore}
                />
            </main>
        </div>
    );
}
