import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LinkIcon, BarChart3 } from 'lucide-react';
import logo from '@/assets/Skylink_logo.png';

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-gradient-card border-b border-border shadow-sky">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
          <img src={logo} alt="SkyLinkLogo" className="h-9 w-910 rounded-full " />

          <h1
  className="text-3xl font-bold tracking-wide"
  style={{ color: '#0486FF', fontFamily: "'Mrs Sheppards', cursive", letterSpacing: '5px' }}
>
  SkyLink
</h1>


          </div>

          {/* Nav Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              asChild
              className="transition-all duration-200"
            >
              <Link to="/">
                <LinkIcon className="w-4 h-4 mr-2" />
                Shorten URLs
              </Link>
            </Button>

            <Button
              variant={location.pathname === '/stats' ? 'default' : 'ghost'}
              asChild
              className="transition-all duration-200"
            >
              <Link to="/stats">
                <BarChart3 className="w-4 h-4 mr-2" />
                Statistics
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
