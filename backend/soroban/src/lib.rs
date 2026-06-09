// MavunoPay Soroban Allocation Contract
// Implements automatic harvest allocation based on farmer-defined rules

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, vec, Env, Error, Symbol, Vec, String, Address};

#[derive(Clone)]
#[contracttype]
pub struct AllocationRule {
    pub key: String,
    pub pct: u32,
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
pub struct AllocationInfo {
    pub key: String,
    pub pct: u32,
    pub amount: i128,
}

const FARMER_RULES: Symbol = symbol_short!("rules");
const ALLOCATION_HISTORY: Symbol = symbol_short!("allochist");

#[contract]
pub struct MavunopayAllocationContract;

#[contractimpl]
impl MavunopayAllocationContract {
    /// Set allocation rules for a farmer (admin-only or farmer-authorized)
    /// Rules must sum to 100%
    pub fn set_allocation_rules(env: Env, farmer: Address, rules: Vec<AllocationRule>) -> Result<(), Error> {
        farmer.require_auth();

        let mut total_pct: u32 = 0;
        for rule in rules.iter() {
            total_pct = total_pct.checked_add(rule.pct).ok_or(Error::from_contract_error(1))?;
        }

        if total_pct != 100 {
            return Err(Error::from_contract_error(2));
        }

        let key = (FARMER_RULES, &farmer);
        env.storage().persistent().set(&key, &rules);

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

    /// Allocate an incoming payment according to farmer's rules
    /// Returns the allocation breakdown
    pub fn allocate_payment(env: Env, farmer: Address, amount: i128) -> Result<AllocationResult, Error> {
        farmer.require_auth();

        let rules = Self::get_allocation_rules(env.clone(), farmer.clone());
        if rules.len() == 0 {
            return Err(Error::from_contract_error(3));
        }

        let mut allocations = vec![&env];
        for rule in rules.iter() {
            let allocated_amount = (amount as i128 * rule.pct as i128) / 100;
            allocations.push_back(AllocationInfo {
                key: rule.key.clone(),
                pct: rule.pct,
                amount: allocated_amount,
            });
        }

        let result = AllocationResult {
            farmer: farmer.clone(),
            amount,
            allocations: allocations.clone(),
        };

        // Record allocation in history
        let history_key = (ALLOCATION_HISTORY, farmer.clone());
        let mut history = env
            .storage()
            .persistent()
            .get::<_, Vec<AllocationResult>>(&history_key)
            .unwrap_or_else(|| vec![&env]);
        history.push_back(result.clone());
        env.storage().persistent().set(&history_key, &history);

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
                key: String::from_str(&env, "emergency"),
                pct: 10,
            },
            AllocationRule {
                key: String::from_str(&env, "education"),
                pct: 10,
            },
            AllocationRule {
                key: String::from_str(&env, "disposable"),
                pct: 60,
            },
        ];

        client.set_allocation_rules(&farmer, &rules);
        let retrieved = client.get_allocation_rules(&farmer);
        assert_eq!(retrieved.len(), 4);
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

        client.set_allocation_rules(&farmer, &rules);
        let result = client.allocate_payment(&farmer, &1000);

        assert_eq!(result.amount, 1000);
        assert_eq!(result.allocations.len(), 2);
    }
}
