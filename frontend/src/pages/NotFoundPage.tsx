const NotFoundPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
            <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
            <p className="text-xl text-muted-foreground mt-4 mb-6">Trang không tồn tại</p>
            <a
                href="/"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Về trang chủ
            </a>
        </div>
    </div>
);

export default NotFoundPage;
