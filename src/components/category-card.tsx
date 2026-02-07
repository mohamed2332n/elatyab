"use client";

interface CategoryCardProps {
  name: string;
  icon?: string;
  itemCount?: number;
  onClick?: () => void;
  className?: string;
}

const CategoryCard = ({
  name,
  icon,
  itemCount,
  onClick,
  className
}: CategoryCardProps) => {
  return (
    <div 
      className={`bg-card rounded-lg p-4 border border-border shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <div className="bg-muted h-16 w-16 rounded-full mb-2 mx-auto flex items-center justify-center">
        {icon ? (
          <span className="text-lg">{icon}</span>
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
        )}
      </div>
      <h4 className="font-medium">{name}</h4>
      {itemCount !== undefined && (
        <p className="text-xs text-muted-foreground mt-1">{itemCount} items</p>
      )}
    </div>
  );
};

export default CategoryCard;