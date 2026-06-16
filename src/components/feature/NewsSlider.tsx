import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const NewsSlider: React.FC = () => {
    const { settings, loading } = useSettings();
    const [currentIndex, setCurrentIndex] = useState(0);

    const banners = settings?.app?.banners || [];

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    if (loading || banners.length === 0) return null;

    return (
        <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-xl mb-6 group bg-slate-100">
            {banners.map((banner: any, index: number) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img src={banner.image} className="w-full h-full object-cover" alt={banner.title} />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                        <h4 className="text-white font-bold text-lg leading-tight mb-1">{banner.title}</h4>
                        <p className="text-emerald-100/80 text-sm line-clamp-1">{banner.content}</p>
                    </div>
                </div>
            ))}
            
            {banners.length > 1 && (
                <div className="absolute bottom-4 right-6 flex gap-1.5">
                    {banners.map((_: any, i: number) => (
                        <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/30'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
