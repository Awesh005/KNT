import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { createPortal } from 'react-dom';
import { Stethoscope, GraduationCap, Flame, ShieldAlert, Baby, PawPrint, Leaf, Activity, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

const mainCategories = [
  { name: 'Medical', value: 'Medical', icon: Stethoscope, path: '/campaigns?category=Medical' },
  { name: 'Education', value: 'Education', icon: GraduationCap, path: '/campaigns?category=Education' },
  { name: 'Memorial', value: 'Memorial', icon: Flame, path: '/campaigns?category=Memorial' },
  { name: 'Disaster Relief', value: 'Disaster Relief', icon: ShieldAlert, path: '/campaigns?category=Disaster Relief' },
];

const otherCategories = [
  { name: 'Children', value: 'Children', icon: Baby, path: '/campaigns?category=Children' },
  { name: 'Animals', value: 'Animals', icon: PawPrint, path: '/campaigns?category=Animals' },
  { name: 'Environment', value: 'Environment', icon: Leaf, path: '/campaigns?category=Environment' },
  { name: 'Emergencies', value: 'Emergencies', icon: Activity, path: '/campaigns?category=Emergencies' },
];

export interface CategoryPillsProps {
  className?: string;
  selectedCategory?: string | null;
  onSelect?: (category: string | 'All') => void;
  showAllOption?: boolean;
}

export function CategoryPills({ className, selectedCategory, onSelect, showAllOption }: CategoryPillsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const otherCausesRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  const handleOtherClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (dropdownOpen) {
      setDropdownOpen(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 12,
      left: rect.left,
      width: rect.width
    });
    setDropdownOpen(true);
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    
    const handleScrollOrClick = (e: Event) => {
      if (otherCausesRef.current && otherCausesRef.current.contains(e.target as Node)) {
        return;
      }
      setDropdownOpen(false);
    };

    window.addEventListener('scroll', handleScrollOrClick, { capture: true });
    window.addEventListener('click', handleScrollOrClick);
    window.addEventListener('resize', handleScrollOrClick);

    return () => {
      window.removeEventListener('scroll', handleScrollOrClick, { capture: true });
      window.removeEventListener('click', handleScrollOrClick);
      window.removeEventListener('resize', handleScrollOrClick);
    };
  }, [dropdownOpen]);

  const isOtherSelected = otherCategories.some(c => c.value === selectedCategory);

  return (
    <div className={cn("w-full overflow-x-auto scrollbar-none pb-4 relative", className)}>
      <div className="flex flex-nowrap md:justify-center gap-4 w-max mx-auto px-4 md:px-0">
        
        {/* All Option */}
        {showAllOption && onSelect && (
          <button
            onClick={() => onSelect('All')}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-5 py-3 border rounded-full shadow-sm transition-all duration-300 group snap-center",
              selectedCategory === 'All' || !selectedCategory
                ? "bg-deep-green border-deep-green text-white shadow-md"
                : "bg-white border-charcoal/10 hover:border-goldenrod hover:shadow-md text-charcoal"
            )}
          >
            <span className={cn("text-[12px] font-bold tracking-[0.05em]", (selectedCategory === 'All' || !selectedCategory) ? "text-white" : "text-charcoal")}>
              All Causes
            </span>
          </button>
        )}
        
        {/* Main Categories */}
        {mainCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.value;
          const buttonClass = cn(
            "flex-shrink-0 flex items-center gap-2 px-5 py-3 border rounded-full shadow-sm transition-all duration-300 group snap-center",
            isSelected 
              ? "bg-deep-green border-deep-green text-white shadow-md" 
              : "bg-white border-charcoal/10 hover:border-goldenrod hover:shadow-md text-charcoal"
          );
          const iconClass = cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
            isSelected
              ? "bg-white/20 text-white"
              : "bg-deep-green/5 text-deep-green group-hover:bg-deep-green group-hover:text-white"
          );

          if (onSelect) {
            return (
              <button
                key={category.name}
                onClick={() => onSelect(category.value)}
                className={buttonClass}
              >
                <div className={iconClass}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={cn("text-[12px] font-bold tracking-[0.05em]", isSelected ? "text-white" : "text-charcoal")}>
                  {category.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={category.name}
              to={category.path}
              className={buttonClass}
            >
              <div className={iconClass}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={cn("text-[12px] font-bold tracking-[0.05em]", isSelected ? "text-white" : "text-charcoal")}>
                {category.name}
              </span>
            </Link>
          );
        })}

        {/* Other Causes Dropdown Button */}
        <button
          ref={otherCausesRef}
          onClick={handleOtherClick}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 pl-4 pr-5 py-2 border rounded-full shadow-sm transition-all duration-300 group snap-center",
            isOtherSelected || dropdownOpen
              ? "bg-white border-goldenrod shadow-md text-charcoal" 
              : "bg-white border-charcoal/10 hover:border-goldenrod hover:shadow-md text-charcoal"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            isOtherSelected || dropdownOpen
              ? "bg-goldenrod text-white"
              : "bg-goldenrod/10 text-goldenrod group-hover:bg-goldenrod group-hover:text-white"
          )}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start ml-1">
            <span className="text-[14px] font-bold tracking-[0.05em] text-charcoal leading-tight">
              Others
            </span>
            <span className="text-[10px] text-charcoal/60 leading-tight">
              View all categories
            </span>
          </div>
        </button>
      </div>

      {/* Dropdown Portal */}
      {dropdownOpen && createPortal(
        <div 
          className="fixed z-50 bg-white rounded-2xl shadow-xl border border-charcoal/10 py-2 w-56 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {otherCategories.map((cat) => {
            const DropdownIcon = cat.icon;
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  if (onSelect) {
                    onSelect(cat.value);
                  } else {
                    navigate(cat.path);
                  }
                  setDropdownOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-3 hover:bg-fog-gray transition-colors text-left",
                  isSelected ? "text-deep-green bg-deep-green/5" : "text-charcoal"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isSelected ? "bg-deep-green/10" : "bg-fog-gray"
                )}>
                  <DropdownIcon className="w-4 h-4" />
                </div>
                <span className="text-[13px] font-medium tracking-wide">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
