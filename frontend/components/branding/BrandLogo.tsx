import React from 'react';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
    variant?: 'light' | 'dark' | 'mark';
    className?: string;
    textClassName?: string;
};

export default function BrandLogo({
    variant = 'light',
    className,
    textClassName,
}: BrandLogoProps) {
    if (variant === 'mark') {
        return (
            <div
                className={cn('font-bold leading-none', className)}
                style={{
                    fontSize: '28px',
                    letterSpacing: '-0.03em',
                    color: '#7C3AED',
                }}
                aria-label="Plano mark"
            >
                P
            </div>
        );
    }

    const baseColor = variant === 'dark' ? '#F9FAFB' : '#111827';

    return (
        <div
            className={cn('font-bold lowercase leading-none', textClassName, className)}
            style={{
                letterSpacing: '-0.03em',
                color: baseColor,
            }}
            aria-label={variant === 'dark' ? 'Plano dark logo' : 'Plano light logo'}
        >
            plan
            <span style={{ color: '#7C3AED' }}>o</span>
        </div>
    );
}
