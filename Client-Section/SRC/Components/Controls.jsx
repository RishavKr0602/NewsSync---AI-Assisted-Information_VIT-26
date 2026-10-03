import React, { useState } from 'react';

export default function Controls({ onSearch, onFilter, onDailyBrief }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [country, setCountry] = useState('');
    const [language, setLanguage] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(search);
    };

    const handleFilterChange = (type, value) => {
        let newCat = '';
        let newCtry = '';
        let newLang = '';

        if (type === 'category') {
            setCategory(value);
            setCountry('');
            setLanguage('');
            newCat = value;
        } else if (type === 'country') {
            setCountry(value);
            setCategory('');
            setLanguage('');
            newCtry = value;
        } else if (type === 'language') {
            setLanguage(value);
            setCategory('');
            setCountry('');
            newLang = value;
        }

        onFilter({ category: newCat, country: newCtry, language: newLang });
    };

    return (
        <section className="controls" id="controlsSection">
            <form className="controls-search" onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search news…"
                />
                <button type="submit" className="btn btn-primary">
                    Search
                </button>
            </form>

            <div className="controls-filters">
                <select
                    value={category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                    <option value="">Category</option>
                    <option value="technology">Technology</option>
                    <option value="business">Business</option>
                    <option value="sports">Sports</option>
                    <option value="health">Health</option>
                    <option value="science">Science</option>
                    <option value="world">World</option>
                </select>

                <select
                    value={country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                >
                    <option value="">Country</option>
                    <option value="in">India</option>
                    <option value="us">USA</option>
                    <option value="gb">UK</option>
                </select>

                <select
                    value={language}
                    onChange={(e) => handleFilterChange('language', e.target.value)}
                >
                    <option value="">Language</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                </select>

                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => onFilter({ category, country, language })}
                >
                    Get News
                </button>

                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={onDailyBrief}
                >
                    Daily Brief
                </button>
            </div>
        </section>
    );
}
