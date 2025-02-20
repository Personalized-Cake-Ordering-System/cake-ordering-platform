import Link from "next/link";

interface BreadcrumbProps {
  items: { label: string; href: string; isLast: boolean }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="breadcrumb" className="flex items-center space-x-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {!item.isLast ? (
            <Link href={item.href} className="text-orange-500 hover:underline hidden md:block">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {index < items.length - 1 && <span className="mx-1">/</span>}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
