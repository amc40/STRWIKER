export default function PlayerPage() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div style={{ display: 'flex', height: '100vh' }}>
        <div className="text-4xl font-bold text-black animate-pulse">
          Hello, World!
        </div>
        <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-lg ml-8 animate-bounce">
          <img
            src="https://source.unsplash.com/random"
            alt="Random"
            className="w-48 h-48 rounded-full"
          />
        </div>
      </div>
    </main>
  );
}
