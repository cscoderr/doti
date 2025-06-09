import { Download, CheckCircle2, CircleDollarSign } from "lucide-react";

interface AgentCardProps {
  id: string;
  name: string;
  type: string;
  description: string;
  interactions: number;
  rating: number;
  users: number;
  price: {
    amount: number;
    period: string;
    chain: string;
  };
  icon: string;
  categories: string[];
  isDownloaded?: boolean;
  onDownload?: (id: string) => void;
  onClick?: () => void;
}

const AgentCard = ({
  id,
  name,
  type,
  description,
  interactions,
  rating,
  users,
  price,
  icon,
  categories,
  isDownloaded,
  onDownload,
  onClick,
}: AgentCardProps) => {
  return (
    <div
      className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 md:p-6 hover:border-primary transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl md:text-3xl">{icon}</div>
          <div>
            <h3 className="font-semibold text-base md:text-lg group-hover:text-primary transition-colors">
              {name}
            </h3>
            <span className="text-xs md:text-sm text-textDark/60 dark:text-textLight/60">
              {type}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-accent">★</span>
          <span className="font-medium text-sm md:text-base">{rating}</span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {categories.map((category, idx) => (
          <span
            key={idx}
            className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
          >
            {category}
          </span>
        ))}
      </div>

      <p className="text-xs md:text-sm text-textDark/80 dark:text-textLight/80 mb-4 line-clamp-2">
        {description}
      </p>

      <div className="flex items-center justify-between text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-textDark/60 dark:text-textLight/60">
            {users} users
          </span>
          <span className="text-textDark/60 dark:text-textLight/60">•</span>
          <span className="text-textDark/60 dark:text-textLight/60">
            {interactions} interactions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-primary font-medium flex items-center gap-1">
            <CircleDollarSign size={16} className="text-accent" />
            {price.amount.toFixed(2)}
            <span className="text-textDark/60 dark:text-textLight/60 ml-1">
              {price.chain} /{price.period}
            </span>
          </div>
          {onDownload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(id);
              }}
              className={`p-2 rounded-full transition-colors ${
                isDownloaded
                  ? "text-accent hover:bg-accent/10"
                  : "text-primary hover:bg-primary/10"
              }`}
            >
              {isDownloaded ? (
                <CheckCircle2 size={20} />
              ) : (
                <Download size={20} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
