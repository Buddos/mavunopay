// MavunoPay Soroban Allocation and Cooperative Contracts
// Implements allocation rules, goal locks, cooperative savings, and admin approvals.

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contractevent, symbol_short, vec, Env, Error, Symbol, Vec, String, Address};

#[derive(Clone)]
#[contracttype]
pub struct AllocationRule {
    pub key: String,
    pub pct: u32,
}

#[derive(Clone)]
#[contracttype]
pub struct AllocationInfo {
    pub key: String,
    pub pct: u32,
    pub amount: i128,
}

#[derive(Clone)]
#[contracttype]
pub struct AllocationResult {
    pub farmer: Address,
    pub amount: i128,
    pub allocations: Vec<AllocationInfo>,
}

#[derive(Clone)]
#[contracttype]
pub struct RuleChangeRecord {
    pub rules: Vec<AllocationRule>,
    pub changed_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct GoalLock {
    pub goal_id: String,
    pub owner: Address,
    pub target_amount: i128,
    pub locked_amount: i128,
    pub unlock_at: u64,
    pub penalty_pct: u32,
    pub released: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct CooperativeProposal {
    pub coop_id: String,
    pub proposal_id: u32,
    pub proposer: Address,
    pub amount: i128,
    pub purpose: String,
    pub approvals: u32,
    pub rejects: u32,
    pub executed: bool,
    pub threshold: u32,
}

#[derive(Clone)]
#[contracttype]
pub struct CoopAuditEntry {
    pub coop_id: String,
    pub action: String,
    pub actor: Address,
    pub timestamp: u64,
    pub details: String,
}

#[derive(Clone)]
#[contracttype]
pub struct AdminAction {
    pub action_id: u32,
    pub action: String,
    pub params: String,
    pub proposer: Address,
    pub approvals: u32,
    pub rejects: u32,
    pub executed: bool,
    pub threshold: u32,
}

const FARMER_RULES: Symbol = symbol_short!("rules");
const RULE_HISTORY: Symbol = symbol_short!("rulehist");
const ALLOCATION_HISTORY: Symbol = symbol_short!("allochist");
const GOAL_BALANCES: Symbol = symbol_short!("goalbal");
const GOAL_LOCKS: Symbol = symbol_short!("goallock");
const COOP_MEMBERS: Symbol = symbol_short!("coopmem");
const COOP_SAVINGS: Symbol = symbol_short!("coopsav");
const COOP_PROPOSALS: Symbol = symbol_short!("coopp");
const COOP_AUDIT: Symbol = symbol_short!("coopaudit");
const ADMIN_ACTIONS: Symbol = symbol_short!("adminact");
const PAUSED_FLAG: Symbol = symbol_short!("paused");
// Contract event types (use the #[contractevent] macro so Soroban SDK
// emits structured, versioned events instead of the deprecated publish tuple API)
#[contractevent]
#[derive(Clone)]
pub struct AllocationCompletedEvent {
    pub farmer: Address,
    pub amount: i128,
    pub allocations: Vec<AllocationInfo>,
}

#[contractevent]
#[derive(Clone)]
pub struct GoalLockedEvent {
    pub farmer: Address,
    pub goal_id: String,
    pub target_amount: i128,
    pub unlock_at: u64,
}

#[contractevent]
#[derive(Clone)]
pub struct EarlyWithdrawalEvent {
    pub farmer: Address,
    pub goal_id: String,
    pub payout: i128,
}

#[contractevent]
#[derive(Clone)]
pub struct CoopWithdrawalEvent {
    pub coop_id: String,
    pub proposal_id: u32,
    pub proposer: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone)]
pub struct AdminActionEvent {
    pub action_id: u32,
    pub action: String,
    pub proposer: Address,
    pub executed: bool,
}

#[contract]
pub struct MavunopayAllocationContract;

#[contractimpl]
impl MavunopayAllocationContract {
    fn current_timestamp(env: &Env) -> u64 {
        env.ledger().timestamp()
    }

    fn record_rule_change(env: &Env, farmer: Address, rules: Vec<AllocationRule>) {
        let record = RuleChangeRecord {
            rules: rules.clone(),
            changed_at: Self::current_timestamp(env),
        };
        let key = (RULE_HISTORY, &farmer);
        let mut history = env
            .storage()
            .persistent()
            .get::<_, Vec<RuleChangeRecord>>(&key)
            .unwrap_or_else(|| vec![env]);
        history.push_back(record);
        env.storage().persistent().set(&key, &history);
    }

    fn validate_rules(rules: &Vec<AllocationRule>) -> Result<(), Error> {
        if rules.len() == 0 {
            return Err(Error::from_contract_error(10));
        }
        let mut total_pct: u32 = 0;
        for rule in rules.iter() {
            if rule.pct == 0 {
                return Err(Error::from_contract_error(11));
            }
            total_pct = total_pct.checked_add(rule.pct).ok_or(Error::from_contract_error(1))?;
        }
        if total_pct != 100 {
            return Err(Error::from_contract_error(2));
        }
        Ok(())
    }

    fn update_goal_balance(env: &Env, farmer: Address, key: String, amount: i128) {
        let storage_key = (GOAL_BALANCES, &farmer, &key);
        let current = env
            .storage()
            .persistent()
            .get::<_, i128>(&storage_key)
            .unwrap_or(0);
        env.storage().persistent().set(&storage_key, &(current + amount));
    }

    /// Set allocation rules for a farmer (admin-only or farmer-authorized)
    /// Rules must be non-empty, positive, and sum to 100%
    pub fn set_allocation_rules(env: Env, farmer: Address, rules: Vec<AllocationRule>) -> Result<(), Error> {
        farmer.require_auth();
        Self::validate_rules(&rules)?;
        let key = (FARMER_RULES, &farmer);
        env.storage().persistent().set(&key, &rules);
        Self::record_rule_change(&env, farmer.clone(), rules);
        Ok(())
    }

    /// Get allocation rules for a farmer
    pub fn get_allocation_rules(env: Env, farmer: Address) -> Vec<AllocationRule> {
        let key = (FARMER_RULES, &farmer);
        env.storage()
            .persistent()
            .get::<_, Vec<AllocationRule>>(&key)
            .unwrap_or_else(|| vec![&env])
    }

    /// Get allocation rule change history for a farmer
    pub fn get_rule_history(env: Env, farmer: Address) -> Vec<RuleChangeRecord> {
        let key = (RULE_HISTORY, &farmer);
        env.storage()
            .persistent()
            .get::<_, Vec<RuleChangeRecord>>(&key)
            .unwrap_or_else(|| vec![&env])
    }

    /// Allocate an incoming payment according to farmer's rules
    /// Records per-goal balances and emits an allocation event.
    pub fn allocate_payment(env: Env, farmer: Address, amount: i128) -> Result<AllocationResult, Error> {
        farmer.require_auth();

        if env.storage().persistent().has(&PAUSED_FLAG) {
            return Err(Error::from_contract_error(23));
        }

        let rules = Self::get_allocation_rules(env.clone(), farmer.clone());
        Self::validate_rules(&rules)?;

        let mut allocations = vec![&env];
        for rule in rules.iter() {
            let allocated_amount = (amount as i128 * rule.pct as i128) / 100;
            allocations.push_back(AllocationInfo {
                key: rule.key.clone(),
                pct: rule.pct,
                amount: allocated_amount,
            });
            Self::update_goal_balance(&env, farmer.clone(), rule.key.clone(), allocated_amount);
        }

        let result = AllocationResult {
            farmer: farmer.clone(),
            amount,
            allocations: allocations.clone(),
        };

        let history_key = (ALLOCATION_HISTORY, farmer.clone());
        let mut history = env
            .storage()
            .persistent()
            .get::<_, Vec<AllocationResult>>(&history_key)
            .unwrap_or_else(|| vec![&env]);
        history.push_back(result.clone());
        env.storage().persistent().set(&history_key, &history);

        AllocationCompletedEvent {
            farmer: farmer.clone(),
            amount,
            allocations: allocations.clone(),
        }
        .publish(&env);

        Ok(result)
    }

    /// Get allocation history for a farmer
    pub fn get_allocation_history(env: Env, farmer: Address) -> Vec<AllocationResult> {
        let key = (ALLOCATION_HISTORY, farmer);
        env.storage()
            .persistent()
            .get::<_, Vec<AllocationResult>>(&key)
            .unwrap_or_else(|| vec![&env])
    }

    /// Get the on-chain goal balance for a farmer and rule key.
    pub fn get_goal_balance(env: Env, farmer: Address, key: String) -> i128 {
        let storage_key = (GOAL_BALANCES, farmer, key);
        env.storage().persistent().get::<_, i128>(&storage_key).unwrap_or(0)
    }

    /// Lock a goal with an on-chain escrow record and a time-based release condition.
    pub fn lock_goal(env: Env, farmer: Address, goal_id: String, unlock_at: u64, target_amount: i128, penalty_pct: u32) -> Result<GoalLock, Error> {
        farmer.require_auth();
        if unlock_at <= Self::current_timestamp(&env) {
            return Err(Error::from_contract_error(12));
        }
        if target_amount <= 0 {
            return Err(Error::from_contract_error(13));
        }
        let lock = GoalLock {
            goal_id: goal_id.clone(),
            owner: farmer.clone(),
            target_amount,
            locked_amount: target_amount,
            unlock_at,
            penalty_pct,
            released: false,
        };
        let storage_key = (GOAL_LOCKS, &farmer, &goal_id);
        env.storage().persistent().set(&storage_key, &lock);
        GoalLockedEvent {
            farmer: farmer.clone(),
            goal_id: goal_id.clone(),
            target_amount: lock.target_amount,
            unlock_at: lock.unlock_at,
        }
        .publish(&env);
        Ok(lock)
    }

    /// Request an early withdrawal from a locked goal, applying penalty if before unlock.
    pub fn penalty_withdrawal(env: Env, farmer: Address, goal_id: String) -> Result<i128, Error> {
        farmer.require_auth();
        let storage_key = (GOAL_LOCKS, &farmer, &goal_id);
        let mut lock: GoalLock = env
            .storage()
            .persistent()
            .get(&storage_key)
            .ok_or(Error::from_contract_error(14))?;
        if lock.released {
            return Err(Error::from_contract_error(15));
        }

        let now = Self::current_timestamp(&env);
        let payout = if now < lock.unlock_at && lock.locked_amount > 0 {
            let fee = (lock.locked_amount * lock.penalty_pct as i128) / 100;
            lock.locked_amount - fee
        } else {
            lock.locked_amount
        };

        lock.released = true;
        env.storage().persistent().set(&storage_key, &lock.clone());
        EarlyWithdrawalEvent {
            farmer: farmer.clone(),
            goal_id: goal_id.clone(),
            payout,
        }
        .publish(&env);
        Ok(payout)
    }

    /// Read a locked goal record.
    pub fn get_goal_lock(env: Env, farmer: Address, goal_id: String) -> GoalLock {
        let storage_key = (GOAL_LOCKS, farmer.clone(), goal_id.clone());
        env.storage()
            .persistent()
            .get::<_, GoalLock>(&storage_key)
            .unwrap_or_else(|| GoalLock {
                goal_id: String::from_str(&env, ""),
                owner: farmer,
                target_amount: 0,
                locked_amount: 0,
                unlock_at: 0,
                penalty_pct: 0,
                released: false,
            })
    }
}

#[contract]
pub struct MavunopayCooperativeContract;

#[contractimpl]
impl MavunopayCooperativeContract {
    fn record_audit(env: &Env, coop_id: String, action: String, actor: Address, details: String) {
        let entry = CoopAuditEntry {
            coop_id: coop_id.clone(),
            action: action.clone(),
            actor: actor.clone(),
            timestamp: env.ledger().timestamp(),
            details: details.clone(),
        };
        let key = (COOP_AUDIT, coop_id.clone());
        let mut history = env
            .storage()
            .persistent()
            .get::<_, Vec<CoopAuditEntry>>(&key)
            .unwrap_or_else(|| vec![env]);
        history.push_back(entry);
        env.storage().persistent().set(&key, &history);
    }

    /// Add a cooperative member.
    pub fn add_member(env: Env, coop_id: String, member: Address) -> Result<(), Error> {
        member.require_auth();
        let key = (COOP_MEMBERS, coop_id.clone(), &member);
        env.storage().persistent().set(&key, &true);
        Self::record_audit(&env, coop_id.clone(), String::from_str(&env, "add_member"), member.clone(), String::from_str(&env, "member added"));
        Ok(())
    }

    /// Contribute funds to the cooperative pool.
    pub fn contribute(env: Env, coop_id: String, member: Address, amount: i128) -> Result<i128, Error> {
        member.require_auth();
        let member_key = (COOP_MEMBERS, coop_id.clone(), &member);
        if !env.storage().persistent().has(&member_key) {
            return Err(Error::from_contract_error(20));
        }
        let savings_key = (COOP_SAVINGS, coop_id.clone());
        let balance = env.storage().persistent().get::<_, i128>(&savings_key).unwrap_or(0);
        let updated = balance + amount;
        env.storage().persistent().set(&savings_key, &updated);
        Self::record_audit(&env, coop_id.clone(), String::from_str(&env, "contribute"), member.clone(), String::from_str(&env, "contribution added"));
        Ok(updated)
    }

    /// Propose a withdrawal from the cooperative savings pool.
    pub fn propose_withdrawal(env: Env, coop_id: String, proposer: Address, proposal_id: u32, amount: i128, purpose: String, threshold: u32) -> Result<CooperativeProposal, Error> {
        proposer.require_auth();
        let member_key = (COOP_MEMBERS, coop_id.clone(), &proposer);
        if !env.storage().persistent().has(&member_key) {
            return Err(Error::from_contract_error(21));
        }
        let proposal = CooperativeProposal {
            coop_id: coop_id.clone(),
            proposal_id,
            proposer: proposer.clone(),
            amount,
            purpose: purpose.clone(),
            approvals: 1,
            rejects: 0,
            executed: false,
            threshold,
        };
        let key = (COOP_PROPOSALS, coop_id.clone(), proposal_id);
        env.storage().persistent().set(&key, &proposal);
        Self::record_audit(&env, coop_id.clone(), String::from_str(&env, "propose_withdrawal"), proposer.clone(), purpose.clone());
        Ok(proposal)
    }

    /// Vote on a cooperative withdrawal proposal.
    pub fn vote_on_withdrawal(env: Env, coop_id: String, voter: Address, proposal_id: u32, approve: bool) -> Result<CooperativeProposal, Error> {
        voter.require_auth();
        let member_key = (COOP_MEMBERS, coop_id.clone(), &voter);
        if !env.storage().persistent().has(&member_key) {
            return Err(Error::from_contract_error(21));
        }
        let key = (COOP_PROPOSALS, coop_id.clone(), proposal_id);
        let mut proposal: CooperativeProposal = env.storage().persistent().get(&key).ok_or(Error::from_contract_error(22))?;
        if proposal.executed {
            return Err(Error::from_contract_error(24));
        }
        if approve {
            proposal.approvals += 1;
        } else {
            proposal.rejects += 1;
        }
        env.storage().persistent().set(&key, &proposal.clone());
        Self::record_audit(&env, coop_id.clone(), String::from_str(&env, "vote_on_withdrawal"), voter.clone(), String::from_str(&env, if approve { "approved" } else { "rejected" }));
        Ok(proposal)
    }

    /// Execute a withdrawal once the M-of-N threshold is met.
    pub fn execute_withdrawal(env: Env, coop_id: String, proposal_id: u32) -> Result<i128, Error> {
        let key = (COOP_PROPOSALS, coop_id.clone(), proposal_id);
        let mut proposal: CooperativeProposal = env.storage().persistent().get(&key).ok_or(Error::from_contract_error(22))?;
        if proposal.executed {
            return Err(Error::from_contract_error(24));
        }
        if proposal.approvals < proposal.threshold {
            return Err(Error::from_contract_error(25));
        }

        let savings_key = (COOP_SAVINGS, coop_id.clone());
        let balance = env.storage().persistent().get::<_, i128>(&savings_key).unwrap_or(0);
        if proposal.amount > balance {
            return Err(Error::from_contract_error(26));
        }

        let updated = balance - proposal.amount;
        env.storage().persistent().set(&savings_key, &updated);
        proposal.executed = true;
        env.storage().persistent().set(&key, &proposal.clone());

        CoopWithdrawalEvent {
            coop_id: coop_id.clone(),
            proposal_id: proposal.proposal_id,
            proposer: proposal.proposer.clone(),
            amount: proposal.amount,
        }
        .publish(&env);
        Self::record_audit(&env, coop_id.clone(), String::from_str(&env, "execute_withdrawal"), proposal.proposer.clone(), String::from_str(&env, "withdrawal executed"));
        Ok(updated)
    }

    /// Get cooperative savings balance.
    pub fn get_coop_savings(env: Env, coop_id: String) -> i128 {
        let key = (COOP_SAVINGS, coop_id);
        env.storage().persistent().get::<_, i128>(&key).unwrap_or(0)
    }

    /// Read cooperative audit history.
    pub fn get_coop_audit(env: Env, coop_id: String) -> Vec<CoopAuditEntry> {
        let key = (COOP_AUDIT, coop_id);
        env.storage().persistent().get::<_, Vec<CoopAuditEntry>>(&key).unwrap_or_else(|| vec![&env])
    }

    /// Submit an admin action that requires multi-signature approval.
    pub fn propose_admin_action(env: Env, action_id: u32, admin: Address, action: String, params: String, threshold: u32) -> Result<AdminAction, Error> {
        admin.require_auth();
        let act = AdminAction {
            action_id,
            action: action.clone(),
            params: params.clone(),
            proposer: admin.clone(),
            approvals: 1,
            rejects: 0,
            executed: false,
            threshold,
        };
        let key = (ADMIN_ACTIONS, action_id);
        env.storage().persistent().set(&key, &act);
        AdminActionEvent {
            action_id,
            action: action.clone(),
            proposer: admin.clone(),
            executed: act.executed,
        }
        .publish(&env);
        Ok(act)
    }

    /// Vote on an admin action.
    pub fn vote_admin_action(env: Env, action_id: u32, admin: Address, approve: bool) -> Result<AdminAction, Error> {
        admin.require_auth();
        let key = (ADMIN_ACTIONS, action_id);
        let mut act: AdminAction = env.storage().persistent().get(&key).ok_or(Error::from_contract_error(27))?;
        if act.executed {
            return Err(Error::from_contract_error(28));
        }
        if approve {
            act.approvals += 1;
        } else {
            act.rejects += 1;
        }
        env.storage().persistent().set(&key, &act.clone());
        Ok(act)
    }

    /// Execute an admin action once the required approvals are reached.
    pub fn execute_admin_action(env: Env, action_id: u32, admin: Address) -> Result<AdminAction, Error> {
        admin.require_auth();
        let key = (ADMIN_ACTIONS, action_id);
        let mut act: AdminAction = env.storage().persistent().get(&key).ok_or(Error::from_contract_error(27))?;
        if act.executed {
            return Err(Error::from_contract_error(28));
        }
        if act.approvals < act.threshold {
            return Err(Error::from_contract_error(29));
        }
        act.executed = true;
        env.storage().persistent().set(&key, &act.clone());
        Ok(act)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_set_and_get_rules() {
        let env = soroban_sdk::Env::default();
        let contract_id = env.register_contract(None, MavunopayAllocationContract);
        let client = MavunopayAllocationContractClient::new(&env, &contract_id);
        let farmer = Address::generate(&env);

        let rules = vec![
            &env,
            AllocationRule {
                key: String::from_str(&env, "inputs"),
                pct: 20,
            },
            AllocationRule {
                key: String::from_str(&env, "savings"),
                pct: 80,
            },
        ];

        client.set_allocation_rules(&farmer, &rules).unwrap();
        let retrieved = client.get_allocation_rules(&farmer);
        assert_eq!(retrieved.len(), 2);
    }

    #[test]
    fn test_allocate_payment() {
        let env = soroban_sdk::Env::default();
        let contract_id = env.register_contract(None, MavunopayAllocationContract);
        let client = MavunopayAllocationContractClient::new(&env, &contract_id);
        let farmer = Address::generate(&env);

        let rules = vec![
            &env,
            AllocationRule {
                key: String::from_str(&env, "inputs"),
                pct: 20,
            },
            AllocationRule {
                key: String::from_str(&env, "savings"),
                pct: 80,
            },
        ];

        client.set_allocation_rules(&farmer, &rules).unwrap();
        let result = client.allocate_payment(&farmer, &1000).unwrap();

        assert_eq!(result.amount, 1000);
        assert_eq!(result.allocations.len(), 2);
        assert_eq!(result.allocations[0].amount + result.allocations[1].amount, 1000);
    }
}
