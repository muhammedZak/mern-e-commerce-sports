import { Link } from 'react-router-dom';

const alignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export default function AuthLink({
  to,
  children,
  align = 'right',
  className = '',
}) {
  return (
    <div className={`mt-4 ${alignmentClasses[align]} ${className}`}>
      <Link
        to={to}
        className='text-sm font-medium text-primary hover:underline'>
        {children}
      </Link>
    </div>
  );
}
