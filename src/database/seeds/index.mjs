import { userSeed } from "./user.mjs";
import { storeSeed } from "./store.mjs";
import { storeBranchSeed } from "./storeBranch.mjs";
import { seedSubscriptionPlans } from "./subscriptionPlan.mjs";

export const main = async () => {
    await userSeed();
    await storeSeed();
    await storeBranchSeed();
    await seedSubscriptionPlans();
};

main();
