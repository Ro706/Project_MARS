import json
import os
from collections import defaultdict

POLICY_FILE = "reward_memory.json" # This file already exists and is used for reward scores.

class RLAgent:
    def __init__(self):
        self.policy = self._load_policy()

    def _load_policy(self):
        if os.path.exists(POLICY_FILE):
            with open(POLICY_FILE, 'r') as f:
                try:
                    return json.load(f)
                except json.JSONDecodeError:
                    return {"top_k_rewards": defaultdict(lambda: {"sum": 0, "count": 0})}
        return {"top_k_rewards": defaultdict(lambda: {"sum": 0, "count": 0})}

    def _save_policy(self):
        # Convert defaultdict to dict for JSON serialization
        serializable_policy = {
            "top_k_rewards": {k: dict(v) for k, v in self.policy["top_k_rewards"].items()}
        }
        with open(POLICY_FILE, 'w') as f:
            json.dump(serializable_policy, f, indent=2)

    def choose_action(self, available_actions):
        """
        Chooses an action (top_k) based on the current policy.
        For simplicity, chooses the top_k with the highest average reward.
        If no history, chooses randomly.
        """
        best_top_k = None
        max_avg_reward = -1

        # Ensure available_actions are strings for consistent key comparison
        available_actions_str = [str(k) for k in available_actions]

        for top_k_str in available_actions_str:
            if top_k_str in self.policy["top_k_rewards"] and self.policy["top_k_rewards"][top_k_str]["count"] > 0:
                avg_reward = self.policy["top_k_rewards"][top_k_str]["sum"] / self.policy["top_k_rewards"][top_k_str]["count"]
                if avg_reward > max_avg_reward:
                    max_avg_reward = avg_reward
                    best_top_k = int(top_k_str)
        
        if best_top_k is None:
            # If no history or all average rewards are 0, choose randomly
            import random
            best_top_k = random.choice(available_actions)
        
        return best_top_k

    def learn(self, action, reward):
        """
        Updates the policy based on the action taken and the reward received.
        """
        action_str = str(action) # Ensure action is string for consistent key
        if action_str not in self.policy["top_k_rewards"]:
            self.policy["top_k_rewards"][action_str] = {"sum": 0, "count": 0}
        
        self.policy["top_k_rewards"][action_str]["sum"] += reward
        self.policy["top_k_rewards"][action_str]["count"] += 1
        self._save_policy()

if __name__ == "__main__":
    # Example usage:
    agent = RLAgent()
    
    # Simulate choosing an action
    available_top_ks = [3, 5, 7]
    chosen_top_k = agent.choose_action(available_top_ks)
    print(f"Chosen top_k: {chosen_top_k}")

    # Simulate learning from a reward
    sample_reward = 0.85
    agent.learn(chosen_top_k, sample_reward)
    print(f"Learned from action {chosen_top_k} with reward {sample_reward}")

    # Choose another action after learning
    chosen_top_k_again = agent.choose_action(available_top_ks)
    print(f"Chosen top_k after learning: {chosen_top_k_again}")
