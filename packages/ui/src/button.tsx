import * as React from "react";

export interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
}

export function Button({ children, onClick }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "10px 20px",
                background: "blue",
                color: "white",
                border: "none",
                borderRadius: "4px",
            }}
        >
            {children}
        </button>
    );
}
