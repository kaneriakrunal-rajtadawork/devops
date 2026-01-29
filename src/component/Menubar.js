"use client";
import * as React from "react";

function MenubarItem({ src, className }) {
    return (
    <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm">
        <img
            src={src}
            alt="Menu item"
            className={`object-contain shrink-0 rounded-sm ${className}`}
        />
    </button>
    );
}

function Menubar() {
    return (
        <nav className="flex overflow-hidden py-2 pr-10 pr-10 bg-white shadow-[0px_1px_0px_rgba(0,0,0,0.08)]">
            <MenubarItem
            src="https://cdn.builder.io/api/v1/image/assets/d972d63ac9304cd18e3dadf3a1c49260/d092179e6b22a7a4d5033fcaaf9b73016af30ed2?placeholderIfAbsent=true"
            className="aspect-[1.09] w-[37px]"
            />
            <MenubarItem
            src="https://cdn.builder.io/api/v1/image/assets/d972d63ac9304cd18e3dadf3a1c49260/c825647ed387f10b760794829243f6de01dfaed0?placeholderIfAbsent=true"
            className="aspect-[0.97] w-[33px]"
            />
            <MenubarItem
            src="https://cdn.builder.io/api/v1/image/assets/d972d63ac9304cd18e3dadf3a1c49260/99989586f00ae8e8f95c3628a640c737e1008715?placeholderIfAbsent=true"
            className="aspect-square w-[34px]"
            />
            <MenubarItem
            src="https://cdn.builder.io/api/v1/image/assets/d972d63ac9304cd18e3dadf3a1c49260/a3e99ccb1a60391d884994aae4dfb0ecba3af073?placeholderIfAbsent=true"
            className="aspect-[0.97] w-[33px]"
            />
                <div className="flex max-w-0 min-h-0" />
        </nav>
    );
}

export default Menubar;
