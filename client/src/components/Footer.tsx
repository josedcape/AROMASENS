export default function Footer() {
  return (
    <footer className="bg-primary text-neutral py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="font-display text-secondary text-xl">AROMASENS</h2>
            <p className="text-neutral-light text-sm mt-1">Encuentra tu fragancia perfecta</p>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="text-neutral-light hover:text-secondary transition-colors">
              <i className="ri-instagram-line text-xl"></i>
            </a>
            <a href="#" className="text-neutral-light hover:text-secondary transition-colors">
              <i className="ri-facebook-fill text-xl"></i>
            </a>
            <a href="#" className="text-neutral-light hover:text-secondary transition-colors">
              <i className="ri-twitter-x-line text-xl"></i>
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-neutral-dark text-sm">
          <p>&copy; {new Date().getFullYear()} AROMASENS Perfume Boutique. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
