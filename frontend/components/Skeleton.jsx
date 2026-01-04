import React from 'react';
import { cn } from '../src/lib/utils';

const Skeleton = ({ className, height, width, shape = 'rect', ...props }) => {
    return (
        <>
            <style>
                {`
                @keyframes skeleton-shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                `}
            </style>
            <div
                className={cn(
                    "relative overflow-hidden bg-gray-200 dark:bg-gray-700",
                    shape === 'circle' ? "rounded-full" : "rounded-md",
                    className
                )}
                style={{ height, width }}
                {...props}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(90deg, transparent 0, rgba(255,255,255, 0.5) 50%, transparent 100%)",
                        animation: "skeleton-shimmer 1.5s infinite linear",
                    }}
                />
            </div>
        </>
    );
};

export default Skeleton;
