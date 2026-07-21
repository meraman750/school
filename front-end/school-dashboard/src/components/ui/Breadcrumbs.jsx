import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-gray-500">
      <Link to="/" className="flex items-center gap-1 hover:text-primary">
        <FiHome className="text-sm" />
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <FiChevronRight className="text-gray-300" />
          {item.path ? (
            <Link to={item.path} className="font-medium hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-900 dark:text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
