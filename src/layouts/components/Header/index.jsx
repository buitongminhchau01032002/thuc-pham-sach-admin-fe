function Header({ children }) {
    return (
        <header className="border-b">
            <div className="container flex h-14 items-center justify-between">
                <p className="text-xl font-bold text-slate-900">{children}</p>
            </div>
        </header>
    );
}

export default Header;
