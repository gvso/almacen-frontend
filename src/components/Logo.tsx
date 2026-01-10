import logo from "/assets/img/logo_full.png";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={className}>
      <img src={logo} alt="Logo" />
    </div>
  );
};

export default Logo;
