import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-white font-sans selection:bg-neon-blue selection:text-black">
      <Navbar />
      <main className="grow w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}