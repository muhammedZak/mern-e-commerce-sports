import { Link } from 'react-router-dom';

export default function AuthFooter({ text, linkText, to, className = '' }) {
  return (
    <div className={`mt-6 text-center text-sm ${className}`}>
      <span className='text-gray-600'>{text} </span>

      <Link to={to} className='font-medium text-primary hover:underline'>
        {linkText}
      </Link>
    </div>
  );
}
