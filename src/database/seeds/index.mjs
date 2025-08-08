import { userSeed } from "./user.mjs";
import { storeSeed } from "./store.mjs";
import { storeBranchSeed } from "./storeBranch.mjs";

export const main = async () => {
    await userSeed();
    await storeSeed();
    await storeBranchSeed();
};

main();
