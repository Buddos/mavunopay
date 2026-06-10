function calculateCreditScore(farmer, goals, transactions, withdrawals, loans) {
  const base = 520;
  const savedTotal = goals.reduce((sum, g) => sum + Number(g.balance || 0), 0);
  const completedGoals = goals.filter((g) => Number(g.balance || 0) >= Number(g.targetAmount || 0)).length;
  const activeLoans = loans.filter((loan) => loan.status === "approved" || loan.status === "pending");
  const payments = transactions.length;
  const onTimeBehavior = Math.min(120, completedGoals * 15);
  const savingsDepth = Math.min(100, Math.round(savedTotal / 1e3));
  const transactionDiversity = Math.min(80, payments * 8);
  const withdrawalPenalty = withdrawals.filter((w) => w.status === "rejected").length * -10;
  const loanPenalty = activeLoans.length * -8;
  let score = base + onTimeBehavior + savingsDepth + transactionDiversity + withdrawalPenalty + loanPenalty;
  score = Math.max(300, Math.min(850, score));
  return score;
}
function determineCreditTier(score) {
  if (score >= 780) return "Platinum";
  if (score >= 700) return "Gold";
  if (score >= 620) return "Silver";
  return "Bronze";
}
function buildCreditProfile(farmer, goals, transactions, withdrawals, loans) {
  const score = calculateCreditScore(farmer, goals, transactions, withdrawals, loans);
  const tier = determineCreditTier(score);
  const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.balance || 0), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0);
  const completedGoals = goals.filter((goal) => Number(goal.balance || 0) >= Number(goal.targetAmount || 0)).length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending").length;
  const activeLoan = loans.find((loan) => loan.status === "approved");
  return {
    farmerId: farmer.id,
    score,
    tier,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    totalSaved,
    totalTarget,
    completedGoals,
    pendingWithdrawals,
    activeLoan: activeLoan ? {
      id: activeLoan.id,
      amount: activeLoan.amount,
      status: activeLoan.status,
      dueDate: activeLoan.dueDate,
      repaidAmount: activeLoan.repaidAmount
    } : null,
    recommendations: [
      completedGoals >= 2 ? "Your savings history is strong. You can borrow more safely." : "Complete more goals to improve your credit tier.",
      totalSaved >= 2e3 ? "Your balance shows consistent saving behavior." : "Save more regularly to increase your rating.",
      pendingWithdrawals === 0 ? "No open withdrawal requests means a healthier credit profile." : "Resolve pending withdrawals before applying for larger loans."
    ]
  };
}
export {
  buildCreditProfile as b
};
