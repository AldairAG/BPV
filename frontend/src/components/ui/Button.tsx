import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    className?: string;
}

const classStyle = `bg-sky-600 text-white inline-flex items-center justify-center 
            gap-2 whitespace-nowrap rounded-md text-sm font-medium 
            ring-offset-background transition-colors 
            disabled:pointer-events-none disabled:opacity-50 
            h-10 px-4 py-2 w-full`

export const Button = ({ children, className, ...props }: ButtonProps) => {
    return (
        <button {...props} className={twMerge(classStyle,className)}>
            {children}
        </button>
    );
}