import { DotiAgent } from "@/types";
import BlockiesIcon from "./BlockiesIcon";
import Image from "next/image";

interface AgentCardProps {
  agent: DotiAgent;
  onDownload?: (id: string) => void;
  onClick?: () => void;
}

const AgentCard = ({ agent, onClick }: AgentCardProps) => {
  return (
    <div
      className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 md:p-6 hover:border-primary transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* <div className="text-2xl md:text-3xl">{icon}</div> */}
          <BlockiesIcon address={`0x${agent.id}`} size={8} />
          <div>
            <h3 className="font-semibold text-base md:text-lg group-hover:text-primary transition-colors">
              {agent.name}
            </h3>
          </div>
        </div>
      </div>

      {/* <div className="mb-3 flex flex-wrap gap-2">
        {categories.map((category, idx) => (
          <span
            key={idx}
            className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
          >
            {category}
          </span>
        ))}
      </div> */}

      <p className="text-xs md:text-sm text-textDark/80 dark:text-textLight/80 mb-4 line-clamp-2">
        {agent.description}
      </p>

      <div className="flex items-center justify-end text-xs md:text-sm">
        {/* <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <span className="text-textDark/60 dark:text-textLight/60">
            {users} users
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-accent">★</span>
          <span className="font-medium text-sm md:text-base">{rating}</span>
        </div> */}
        {agent.pricingModel !== "free" && (
          <div className="flex items-center gap-2">
            <div className="text-primary font-medium flex items-center gap-1">
              <Image src="/usdc.svg" width={16} height={16} alt="USDC logo" />
              {agent.price} USDC
              <span className="text-textDark/60 dark:text-textLight/60">
                / {agent.pricingModel}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentCard;
