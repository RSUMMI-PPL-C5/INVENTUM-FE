'use client';

import React from 'react'

interface MyComponentProps {
    name: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ name }) => {
    return <div>Hello, {name}!</div>;
};