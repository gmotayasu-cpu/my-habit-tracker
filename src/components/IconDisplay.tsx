import React from 'react';
import { ICONS } from '../constants';
import { Activity } from 'lucide-react';

type IconDisplayProps = {
    iconName: string;
    className?: string;
};

export const IconDisplay: React.FC<IconDisplayProps> = ({ iconName, className }) => {
    const Icon = ICONS[iconName] || Activity;
    return <Icon className={className} />;
};
