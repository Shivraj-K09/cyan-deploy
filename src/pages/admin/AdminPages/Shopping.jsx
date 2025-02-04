import { ChevronLeftIcon, ListIcon, PlusCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  {
    name: "Add Products",
    icon: PlusCircleIcon,
    href: "/admin/shopping/add-product",
  },
  {
    name: "List of Products",
    icon: ListIcon,
    href: "/admin/shopping/product-list",
  },
];

export function Shopping() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col h-screen ">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 h-14 flex items-center">
        <button onClick={handleBack} className="flex items-center">
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 flex-1 ml-2">
            Shopping
          </h3>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <nav className="z-50">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className="flex items-center p-4 hover:bg-gray-50"
                >
                  <item.icon className="h-6 w-6 text-gray-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
