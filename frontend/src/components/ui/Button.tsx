import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    className?: string;
}

export const Button = ({ children, ...props }: ButtonProps) => {
    return (
        <button className="bg-sky-600 text-white inline-flex items-center justify-center 
            gap-2 whitespace-nowrap rounded-md text-sm font-medium 
            ring-offset-background transition-colors 
            focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring focus-visible:ring-offset-2 
            disabled:pointer-events-none disabled:opacity-50 
            [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 
            [&amp;_svg]:shrink-0 bg-primary text-primary-foreground 
            hover:bg-primary/90 h-10 px-4 py-2 w-full" {...props}>
        {children}
        </button>
    );
}