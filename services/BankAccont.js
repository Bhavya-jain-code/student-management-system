class BankAccount {
  #balance;

  constructor(accountHolder, balance) {
    this.accountHolder = accountHolder;

    this.#balance = balance;
  }

  deposit(amount) {
    if (amount <= 0) {
      throw new Error("Invalid Amount");
    }

    this.#balance += amount;
  }

  getBalance() {
    return this.#balance;
  }
}

module.exports = BankAccount;
