import React from "react";
import { twMerge } from "tailwind-merge";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    id: string;
    label?: string;
    className?: string;
    classNameLabel?: string;
    classNameInput?: string;
    variant?: 'default' | 'search'; // ← nueva variante
};

export const Input: React.FC<InputProps> = ({
    id,
    className,
    classNameInput,
    classNameLabel,
    label,
    variant = 'default',
    ...props
}) => {
    const isSearch = variant === 'search';

    return (
        <div className={twMerge("space-y-2", className)}>
            {label && (
                <label
                    className={twMerge("text-sm font-medium leading-none" +
                        "peer-disabled:cursor-not-allowed " +
                        "peer-disabled:opacity-70 text-white",classNameLabel)}
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {isSearch && (
                    <MagnifyingGlassIcon
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 
                        text-gray-400 pointer-events-none"
                    />
                )}
                <input
                    id={id}
                    type={isSearch ? 'search' : props.type}
                    {...props}
                    className={twMerge(
                        "flex h-10 w-full rounded-md border border-inpu px-3 py-2 text-base focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset md:text-sm",
                        isSearch && "pl-10" // ← espacio para el ícono
                    , classNameInput)}
                />
            </div>
        </div>
    );
};
