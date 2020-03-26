/**
 * @description Since 'unlimited' is when creditLimit is set to MAX_SAFE_INTEGER
 * this function returns true when the creditLimit is more than 90% of MAX_SAFE_INTEGER,
 * for which, in practice, is nearly impossible that a client has a creditLimit
 * deliberaltedly set up to 90% of MAX_SAFE INTEGER. So, we can assume that > 90% of
 * MAX_SAFE_INTEGER is equal to unlimited
 *
 * @purpose Is inteded to set a standard to define whether a creditLimit is unlimited or not
 */
const isUnlimited = creditLimit => creditLimit > Number.MAX_SAFE_INTEGER * 0.9;

export { isUnlimited };
