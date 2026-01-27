'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { LuSun, LuMoon } from 'react-icons/lu';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="p-2 w-10 h-10 rounded-full bg-gray-100/50 dark:bg-gray-800/50 animate-pulse" />;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <LuSun className="w-5 h-5 text-amber-400" />
            ) : (
                <LuMoon className="w-5 h-5 text-indigo-600" />
            )}
        </button>
    );
}
