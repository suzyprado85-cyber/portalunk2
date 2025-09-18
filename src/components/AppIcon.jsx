import React from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

function Icon({
    name,
    size = 24,
    color = "currentColor",
    className = "",
    strokeWidth = 2,
    ...props
}) {
    // Custom icons
    if (name === 'YouTube') {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
                <path d="M23 7.5s-.2-1.7-.8-2.4c-.8-.9-1.7-.9-2.1-1C16.8 3 12 3 12 3s-4.8 0-7.9.1c-.4 0-1.3 0-2.1 1C1.2 5.8 1 7.5 1 7.5S.8 9.7.8 12c0 2.3.2 4.5.2 4.5s.2 1.7.8 2.4c.8.9 1.8.9 2.2 1 2.1.1 7.9.1 7.9.1s4.8 0 7.9-.1c.4 0 1.3 0 2.1-1 .6-.7.8-2.4.8-2.4s.2-2.2.2-4.5c0-2.3-.2-4.5-.2-4.5z" fill={color} />
                <path d="M10 15V9l5 3-5 3z" fill="#fff" />
            </svg>
        );
    }

    if (name === 'SoundCloud') {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
                <path d="M5 15.5c0-1.7 1.3-3 3-3 .1 0 .2 0 .3.01.2-1 1.1-1.51 2.2-1.51.9 0 1.6.3 2 1 .4-.6 1.1-1 2-1 1.3 0 2.3.8 2.6 2 .6-.2 1.4-.3 2.1-.3 2.2 0 4 1.8 4 4s-1.8 4-4 4H6C4.3 20.5 3 19.2 3 17.5S4.3 14.5 6 14.5H5z" fill={color} />
            </svg>
        );
    }

    const IconComponent = LucideIcons?.[name];

    if (!IconComponent) {
        return <HelpCircle size={size} color="gray" strokeWidth={strokeWidth} className={className} {...props} />;
    }

    return <IconComponent
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
    />;
}
export default Icon;
