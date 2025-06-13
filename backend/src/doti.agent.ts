// lib/services/AgentService.ts
// import { DotiAPI, AgentManager, UserAgent } from '../core/AgentManager';
import * as fs from "fs";
import { DotiAgentManager, UserAgent, UserProfile } from "./doti.agent.manager";

export class DotiAgentService {
  private static instance: DotiAgentService;
  private api: DotiAgentManager;
  private persistentAgents: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): DotiAgentService {
    if (!DotiAgentService.instance) {
      DotiAgentService.instance = new DotiAgentService();
    }
    return DotiAgentService.instance;
  }

  constructor() {
    this.api = new DotiAgentManager();
    this.initializePersistentAgents();
  }

  async createUser(address: string): Promise<UserProfile> {
    return this.api.createUser(address);
  }

  /**
   * Initialize all public agents and user agents that should be persistent
   */
  private async initializePersistentAgents() {
    try {
      // Start all public agents
      const publicAgents = this.api.getPublicAgents();
      for (const agent of publicAgents) {
        await this.ensureAgentRunning(agent.id);
      }

      // Auto-start agents that were running before server restart
      await this.restoreRunningAgents();

      console.log(`✓ Initialized ${publicAgents.length} persistent agents`);
    } catch (error) {
      console.error("Failed to initialize persistent agents:", error);
    }
  }

  /**
   * Ensure an agent stays running with health checks
   */
  async ensureAgentRunning(agentId: string): Promise<void> {
    try {
      // this.api.deleteAgentConfig(agentId);
      await this.api.startAgent(agentId);

      // Set up health check interval
      if (!this.persistentAgents.has(agentId)) {
        const healthCheckInterval = setInterval(async () => {
          try {
            await this.healthCheckAgent(agentId);
          } catch (error) {
            console.error(`Health check failed for agent ${agentId}:`, error);
            // Attempt to restart
            try {
              await this.api.stopAgent(agentId);
              await this.api.startAgent(agentId);
              console.log(`✓ Restarted agent ${agentId}`);
            } catch (restartError) {
              console.error(
                `Failed to restart agent ${agentId}:`,
                restartError
              );
            }
          }
        }, 60000); // Check every minute

        this.persistentAgents.set(agentId, healthCheckInterval);
      }
    } catch (error) {
      console.error(`Failed to ensure agent ${agentId} is running:`, error);
      throw error;
    }
  }

  /**
   * Health check for an agent
   */
  private async healthCheckAgent(agentId: string): Promise<void> {
    const agent = this.api.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    // Add specific health check logic here
    // For now, just verify the agent config exists
  }

  /**
   * Create and start an agent
   */
  async createAndStartAgent(
    ownerAddress: string,
    name: string,
    description: string,
    prompt: string,
    isPublic: boolean = false
  ): Promise<UserAgent> {
    console.log("Creating agent");

    const agent = await this.api.createAgent(
      ownerAddress,
      name,
      description,
      prompt,
      isPublic
    );

    // Start the agent immediately
    await this.ensureAgentRunning(agent.id);

    // If it's public, add to persistent agents
    if (isPublic) {
      this.saveRunningAgentState(agent.id);
    }

    return agent;
  }

  /**
   * Stop an agent and clean up
   */
  async stopAgent(agentId: string): Promise<void> {
    await this.api.stopAgent(agentId);

    // Clear health check interval
    if (this.persistentAgents.has(agentId)) {
      clearInterval(this.persistentAgents.get(agentId));
      this.persistentAgents.delete(agentId);
    }

    this.removeRunningAgentState(agentId);
  }

  /**
   * Get all available agents (public + user's private)
   */
  getAvailableAgents(userAddress?: string): UserAgent[] {
    const publicAgents = this.api.getPublicAgents();

    if (userAddress) {
      const userAgents = this.api.getUserAgents(userAddress);
      return [...publicAgents, ...userAgents];
    }

    return publicAgents;
  }

  /**
   * Save running agent state for persistence
   */
  private saveRunningAgentState(agentId: string) {
    // Save to a file or database to restore after server restart
    const stateFile = ".data/running-agents.json";

    try {
      let runningAgents: string[] = [];
      if (fs.existsSync(stateFile)) {
        runningAgents = JSON.parse(fs.readFileSync(stateFile, "utf8"));
      }

      if (!runningAgents.includes(agentId)) {
        runningAgents.push(agentId);
        fs.writeFileSync(stateFile, JSON.stringify(runningAgents, null, 2));
      }
    } catch (error) {
      console.error("Failed to save running agent state:", error);
    }
  }

  /**
   * Remove agent from running state
   */
  private removeRunningAgentState(agentId: string) {
    const stateFile = ".data/running-agents.json";

    try {
      if (fs.existsSync(stateFile)) {
        let runningAgents: string[] = JSON.parse(
          fs.readFileSync(stateFile, "utf8")
        );
        runningAgents = runningAgents.filter((id) => id !== agentId);
        fs.writeFileSync(stateFile, JSON.stringify(runningAgents, null, 2));
      }
    } catch (error) {
      console.error("Failed to remove running agent state:", error);
    }
  }

  /**
   * Restore agents that were running before server restart
   */
  private async restoreRunningAgents() {
    const stateFile = ".data/running-agents.json";

    try {
      if (fs.existsSync(stateFile)) {
        const runningAgents: string[] = JSON.parse(
          fs.readFileSync(stateFile, "utf8")
        );

        for (const agentId of runningAgents) {
          const agent = this.api.getAgent(agentId);
          if (agent) {
            await this.ensureAgentRunning(agentId);
            console.log(`✓ Restored agent ${agent.name} (${agentId})`);
          }
        }
      }
    } catch (error) {
      console.error("Failed to restore running agents:", error);
    }
  }

  /**
   * Get agent status
   */
  getAgentStatus(agentId: string): {
    isRunning: boolean;
    agent: UserAgent | null;
  } {
    const agent = this.api.getAgent(agentId);
    const isRunning = this.persistentAgents.has(agentId);

    return { isRunning, agent };
  }

  /**
   * List all running agents
   */
  getRunningAgents(): Array<{ agentId: string; agent: UserAgent | null }> {
    return Array.from(this.persistentAgents.keys()).map((agentId) => ({
      agentId,
      agent: this.api.getAgent(agentId),
    }));
  }

  getAgents(): Array<UserAgent> {
    return this.api.getPublicAgents();
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log("Shutting down agent service...");

    // Stop all health check intervals
    for (const [agentId, interval] of this.persistentAgents) {
      clearInterval(interval);
    }

    this.persistentAgents.clear();
    console.log("✓ Agent service shutdown complete");
  }
}

// Export singleton instance
export const agentService = DotiAgentService.getInstance();

// Graceful shutdown handling
process.on("SIGTERM", async () => {
  await agentService.shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await agentService.shutdown();
  process.exit(0);
});
