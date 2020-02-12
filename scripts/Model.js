class NameManager {
    unUsedNames = ['Mati', 'Pati', 'Leszke', 'Moniek', 'Edawrd', 'Dzejkob', 'Roman', 'Andzej', "Geralt", "Ciri"];
    usedNames = [];

    reset() {
        this.unUsedNames = ['Mati', 'Pati', 'Leszke', 'Moniek', 'Edawrd', 'Dzejkob', 'Roman', 'Andzej', "Geralt", "Ciri"];
        this.usedNames = [];
    }
}

globalNameManager = new NameManager();

class Level {
    customersToSpawn;
    spawnIntervals;
    customerCanWait;
    constructor(customersToSpawn, spawnIntervals, customerCanWait) {
        this.customersToSpawn = this.getRandomCustomerToSpawn(customersToSpawn);
        this.spawnIntervals = spawnIntervals;
        this.customerCanWait = customerCanWait;
    }
    getRandomCustomerToSpawn(customersToSpawn) {
        let random = Math.floor(Math.random() * (customersToSpawn[1] - customersToSpawn[0] + 1)) + customersToSpawn[0];
        return random;
    }

    getRandomSpawnInterval() {
        let random = Math.floor(Math.random() * (this.spawnIntervals[1] - this.spawnIntervals[0] + 1)) + this.spawnIntervals[0];
        return random;
    }

    getRandomCustomerWaitingTime() {
        let random = Math.floor(Math.random() * (this.customerCanWait[1] - this.customerCanWait[0] + 1)) + this.customerCanWait[0];
        return random;
    }
}

class Restaurant {
    recipe;
    burger;
    customers = [];
    freeSlots = [0, 1, 2, 3, 4, 5, 6, 7];
    occupiedSltos = [];
    customersToSpawn;
    levels = [];
    observableLevels;

    earnedCash = 0;
    servicedCustomers = 0;
    timeInterval;
    time = 0;

    constructor(levels) {
        this.inicializeSampleLevels();
        this.setUpRestaurant();
        console.log(this.levels);
    }

    startCountTime() {
        this.timeInterval = setInterval(() => {
            this.time++;
        }, 1000)
    }

    stopCounTime() {
        clearInterval(this.timeInterval);
        return this.time;
    }

    checkLevelEnd() {
        if (!this.customersToSpawn) {
            return !this.occupiedSltos.length;
        }
        return false;
    }

    inicializeSampleLevels() {
        this.levels = [new Level([4, 9], [4, 10], [30, 120]), new Level([6, 15], [3, 7], [30, 90])];
    }

    setUpRestaurant() {
        globalNameManager.reset();
        this.recipe = new Recipe();
        this.burger = new Burger();
        this.customers = [];
        this.freeSlots = [0, 1, 2, 3, 4, 5, 6, 7];
        this.occupiedSltos = [];
        this.time = 0;
        this.timeInterval = null;
    }

    getObservableLevel(levelIndex) {
        const levelToLoad = this.levels[levelIndex];
        this.customersToSpawn = levelToLoad.customersToSpawn;
        return this.createObservableLevelSpawner(levelToLoad);
    }

    //TODO: GO TO LEVEL?? // Exclude methods?
    createObservableLevelSpawner(level) {
        let levelToSpawn = level;
        let customersToSpawn = level.customersToSpawn;
        return rxjs.Observable.create((observer) => {
            try {
                let spawn = () => {
                    let randomSpawnInterval = level.getRandomSpawnInterval(); /* Math.floor(Math.random() * (10 - 2)) + 2 */
                    setTimeout(() => {
                        if (customersToSpawn && this.hasFreeSlot()) {
                            observer.next(this.addCustomer(levelToSpawn.getRandomCustomerWaitingTime()));
                            customersToSpawn--;
                            console.log(--this.customersToSpawn);
                            spawn();
                        } else if (customersToSpawn) {
                            spawn();
                        }
                        if (!customersToSpawn) {
                            observer.complete();
                            return;
                        }
                    }, randomSpawnInterval * 1000)
                }
                spawn();
                this.startCountTime();
            } catch (err) {
                observer.error(err);
            }
        })
    }

    //TODO: random can wait time should be in customer class
    addCustomer(customerCanWaitTime) {
        const customer = new Customer(customerCanWaitTime);
        customer.occupiedSlot = this.getRandomSlotIndex();
        this.markSlotAsOccupied(customer.occupiedSlot);
        this.customers.push(customer);
        return customer;
    }

    getCustomer(occupiedSlot) {
        return this.customers.find((customer) => {
            return customer.occupiedSlot == occupiedSlot
        });
    }

    getRandomSlotIndex() {
        const random = Math.floor(Math.random() * this.freeSlots.length);
        const randomSlot = this.freeSlots.splice(random, 1)[0];
        return randomSlot;
    }

    markSlotAsOccupied(index) {
        this.occupiedSltos.push(index);
    }

    hasFreeSlot() {
        return this.freeSlots.length;
    }

    checkIfYouGiveCorrectBurger(occupiedSlotByCustomer) {
        const customer = this.getCustomer(occupiedSlotByCustomer);
        if (customer.isGivenBurgerCorrect(this.burger)) {
            return this.handleOrderSuccess(customer);
        } else {
            customer.cutHalfTimeToWait();
            return false
        }
    }

    addMoney(ammount) {
        return this.earnedCash += ammount;
    }

    handleOrderSuccess(customer) {
        this.servicedCustomers++;
        this.removeBurger();
        //TODO: Change it?
        let sucessedOrderInformation = {
            moneyToAdd: this.addMoney(customer.possiblePayment),
            ...this.handleRemoveCustomer(customer)
        }
        console.log(sucessedOrderInformation);
        return sucessedOrderInformation;
    }

    handleRemoveCustomer(customer) {
        this.makeSlotFree(customer);
        this.makeNameFree(customer)
        this.removeCustomer(customer);

        //TODO: Move it
        if (this.checkLevelEnd()) {
            return {
                occupiedSlotToRemove: customer.occupiedSlot,
                servicedCustomers: this.servicedCustomers,
                earnedCash: this.earnedCash,
                timeUsed: this.stopCounTime()
            }
        } else {
            return {
                occupiedSlotToRemove: customer.occupiedSlot
            }
        }
    }

    removeBurger() {
        this.burger = new Burger();
    }

    removeCustomer(handleCustomer) {
        this.customers = this.customers.filter((customer) => customer != handleCustomer);
        console.log(this.customers);
    }

    makeSlotFree(customer) {
        this.occupiedSltos = this.occupiedSltos.filter((ocupiedSlot) => customer.occupiedSlot != ocupiedSlot);
        this.freeSlots.push(customer.occupiedSlot);
    }
    makeNameFree(customer) {
        globalNameManager.usedNames = globalNameManager.usedNames.filter((name) => customer.name != name);
        globalNameManager.unUsedNames.push(customer.name);
    }
}

class Customer {

    possiblePayment;
    occupiedSlot;
    burger;
    name;

    //For Counter
    progressTime = 100;
    subtractionValue;


    constructor(timeToWait) {
        this.name = this.getRandomName();
        this.burger = new Burger();
        /* this.realTimeToWait = realTimeToWait; */
        this.burger.ingredients = new Recipe().getRandomBurgerRecipe();
        this.addTopAndBottomRollToBurger();
        this.countSubtractionValue(timeToWait);
        this.countPossiblePayment();
    }

    addTopAndBottomRollToBurger() {
        this.burger.ingredients.unshift('bottomOfBurger');
        this.burger.ingredients.push('topOfBurger');
    }

    getRandomName() {
        const random = Math.floor(Math.random() * globalNameManager.unUsedNames.length);
        const randomName = globalNameManager.unUsedNames.splice(random, 1)[0];
        globalNameManager.usedNames.push(randomName)
        return randomName;
    }

    cutHalfTimeToWait() {
        this.progressTime -= (this.progressTime * .5);
    }

    isGivenBurgerCorrect(burger) {
        return this.burger.ingredients.length == burger.ingredients.length &&
            burger.hasRollsInCorrectPlaces() &&
            JSON.stringify(this.burger.ingredients.sort()) == JSON.stringify(burger.ingredients.sort())
    }

    countSubtractionValue(time) {
        this.subtractionValue = this.progressTime / time;
    }

    countPossiblePayment() {
        this.possiblePayment = this.burger.ingredients.length;
    }
}

class Recipe {
    maxNumberOfIngredients = 7;
    minNumberOfIngredients = 3;
    aviableIngredients = [];

    constructor() {
        this.aviableIngredients = IngredientsBoard.getAviableIngredients();
    }

    getRandomBurgerRecipe() {
        let ingredients = [];
        const numberOfIngredients = this.getRandomNumberOfIngredients();
        for (let i = 0; i < numberOfIngredients; i++) {
            let randomIngredient = Math.floor(Math.random() * this.aviableIngredients.length);
            ingredients.push(this.aviableIngredients[randomIngredient]);
        }
        return ingredients;
    }

    getRandomNumberOfIngredients() {
        return Math.floor(Math.random() * (this.maxNumberOfIngredients - this.minNumberOfIngredients + 1)) + this.minNumberOfIngredients;
    }

}

class Burger {

    ingredients = [];

    addIngredient(ingredient) {
        this.ingredients.push(ingredient);
    }

    getBurgerIngredients() {
        return this.ingredients;
    }

    hasRollsInCorrectPlaces() {
        return this.ingredients[0] == 'bottomOfBurger' &&
            this.ingredients[this.ingredients.length - 1] == 'topOfBurger'
    }
}

class IngredientsBoard {

    static ingredients = ['tomato', 'lettuce', 'cheese', 'burgerMeat'];

    static getAviableIngredients() {
        return this.ingredients;
    }
}