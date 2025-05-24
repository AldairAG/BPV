import React from 'react'
import { twMerge } from 'tailwind-merge'

interface CardProps {
    children?: React.ReactNode,
    className?: string
}

const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div className={twMerge("bg-gray-800 shadow-md rounded-lg p-4 mb-4 space-x-2", className)}>
            {children}
        </div>
    )
}

const CardDescription: React.FC<CardProps> = ({ children, className }) => {
    return (
        <p className={twMerge("text-sm text-gray-300", className)}>
            {children}
        </p>
    )
}
const CardHead: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div className={twMerge("space-y-1 mb-8", className)}>
            {children}
        </div>

    )
}

const CardTittle: React.FC<CardProps> = ({ children, className }) => {
    return (
        <h3 className={twMerge("text-white text-3xl font-semibold leading-none tracking-tight", className)}>
            {children}
        </h3>
    )
}

const CardContent: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div className={twMerge("flex", className)}>
            {children}
        </div>
    )
}

const Badge: React.FC<CardProps> = ({ children, className }) => {
    return (
        <span className={twMerge("text-xs font-semibold px-4 py-1 rounded-full bg-gray-700 text-white", className)}>
            {children}
        </span>
    )
}



export { Card, CardTittle, CardDescription, Badge, CardHead, CardContent };