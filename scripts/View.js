class RecipesManager {

    recipesDiv;
    recipes = [];

    constructor() {
        this.recipesDiv = document.querySelector('.recipes');
    }

    spawnRecipe(customer, customerImage) {
        //TODO: Extract methods
        //Remove topOfBurger and bottomOfBurger because we don`t need it in recipe;
        let copyOfIngredients = [...customer.burger.ingredients];
        copyOfIngredients.pop();
        copyOfIngredients.shift();

        let recipeDiv = document.createElement('div');
        recipeDiv.dataset.recipeId = customer.occupiedSlot;
        let recipeIngredientsDiv = document.createElement('div');
        let recipeUl = document.createElement('ul');
        let nameOfBurgerCustomerHeading = document.createElement('h1');

        nameOfBurgerCustomerHeading.textContent = `${customer.name}\`s Burger`
        recipeDiv.classList.add('recipe');
        recipeIngredientsDiv.classList.add('recipe__ingredients');
        customerImage.classList.add('recipe__img');

        recipeIngredientsDiv.appendChild(recipeUl);
        recipeDiv.appendChild(nameOfBurgerCustomerHeading);
        recipeDiv.appendChild(recipeIngredientsDiv);
        recipeDiv.appendChild(customerImage);

        copyOfIngredients.forEach(ingredient => {
            let recipeIngredientLi = document.createElement('li');
            recipeIngredientLi.classList.add('recipe-li');
            recipeIngredientLi.dataset.recipeLi = ingredient;
            recipeIngredientLi.textContent = ingredient;
            recipeUl.appendChild(recipeIngredientLi);
        });

        this.recipes[customer.occupiedSlot] = recipeDiv;
        setTimeout(() => {
            this.recipesDiv.insertBefore(recipeDiv, this.recipesDiv.firstChild)
        }, 2000);
    }

    removeRecipe(recipeId) {
        this.recipes[recipeId].remove();
    }
}

class ImageManager {

    static customersURLs = [
        'img/characters/character_1.png',
        'img/characters/character_2.png',
        'img/characters/character_3.png'
    ]

    static getPreparedCustomerDOMImage(customerSlot) {
        let customerImg = document.createElement('img');
        customerImg.dataset.occupiedSlot = customerSlot;
        customerImg.src = this.getRandomCusomerPhotoUrl();
        return customerImg;
    }

    static getRandomCusomerPhotoUrl() {
        const random = Math.floor(Math.random() * this.customersURLs.length);
        return this.customersURLs[random];
    }
}

class CustomersManager {

    customersDiv;
    customerSlots = [];

    constructor() {
        this.customersDiv = document.querySelector('.customers__container');
        this.customerSlots = [...this.customersDiv.children];
    }

    removeCustomer(occupiedSlotToRemove) {
        this.customerSlots[occupiedSlotToRemove].classList.remove('customer__show');
        this.customerSlots[occupiedSlotToRemove].innerHTML = '';
    }
    spawnCustomer(customer, customerImage) {
        let customerSlot = this.customerSlots[customer.occupiedSlot];
        let customerNameDiv = document.createElement('div');
        let customerProgressBar = document.createElement('div');
        customerProgressBar.classList.add(`customer__progress-bar`);
        customerProgressBar.classList.add(`customer__progress-bar--${customer.occupiedSlot}`);
        customerNameDiv.classList.add('customer__name');
        customerProgressBar.textContent = customer.name;
        customerNameDiv.appendChild(customerProgressBar);
        customerSlot.appendChild(customerNameDiv);
        customerSlot.appendChild(customerImage);

        setTimeout(() => {
            customerSlot.classList.add('customer__show');
        }, this.delayToAddCustomer);
    }

    getCustomerProgressBar(occupiedSlot) {
        return document.querySelector(`.customer__progress-bar--${occupiedSlot}`);
    }
}

class BurgerManager {
    burgerDiv;
    ingredientsURLs = {
        'topOfBurger': 'img/burger/topOfBurger.png',
        'bottomOfBurger': 'img/burger/bottomOfBurger.png',
        'lettuce': 'img/burger/lettuce.png',
        'cheese': 'img/burger/cheese.png',
        'tomato': 'img/burger/tomato.png',
        'burgerMeat': 'img/burger/burgerMeat.png'
    }

    constructor() {
        this.burgerDiv = document.querySelector('.burger');
    }

    getIngredientUrlPath(ingredient) {
        return this.ingredientsURLs[ingredient];
    }

    addIngredient(ingredientName) {
        let ingredientToAdd = document.createElement('img');
        ingredientToAdd.src = this.getIngredientUrlPath(ingredientName);
        ingredientToAdd.dataset.ingredient = ingredientName;
        this.burgerDiv.insertBefore(ingredientToAdd, this.burgerDiv.firstChild);
    }

    backBurgerToOriginPosition() {
        this.burgerDiv.removeAttribute("style");
        this.burgerDiv.removeAttribute("data-x");
        this.burgerDiv.removeAttribute("data-y");
    }

    removeBurger(e) {
        this.burgerDiv.innerHTML = '';
        this.backBurgerToOriginPosition(this.burgerDiv);
        //if event 
        if (e) {
            e.target.classList.remove("bin--active");
        }
    }
}

class View {

    customersManager;
    recipesManager;
    burgerManager;
    imageManager;
    moneyText;
    UI;

    constructor() {
        this.moneyText = document.querySelector('.money');
        this.customersManager = new CustomersManager();
        this.recipesManager = new RecipesManager();
        this.burgerManager = new BurgerManager();
        this.UI = new UI();
    }

    addIngredientToBurger(ingredientName) {
        this.burgerManager.addIngredient(ingredientName);
    }

    //TODO: Refactor isOrderCorrectInformations name??
    handleGivenBurger(isOrderCorrectInformations) {
        isOrderCorrectInformations ?
            this.handleOrderSuccess(isOrderCorrectInformations) :
            this.burgerManager.backBurgerToOriginPosition();
    }

    handleSpawnCustomer(customer) {
        let customerImage = ImageManager.getPreparedCustomerDOMImage(customer.occupiedSlot);
        let copyCustomerImage = customerImage.cloneNode(true);
        this.customersManager.spawnCustomer(customer, customerImage);
        this.recipesManager.spawnRecipe(customer, copyCustomerImage);
    }

    //TODO: Rename
    handleOrderSuccess(informations) {
        this.updateMoney(informations.moneyToAdd);
        this.handleRemoveCustomer(informations);
        this.burgerManager.removeBurger();
    }

    handleRemoveCustomer(informations) {
        this.customersManager.removeCustomer(informations.occupiedSlotToRemove);
        this.recipesManager.removeRecipe(informations.occupiedSlotToRemove);
        //Check if game win
        if (informations.timeUsed) {
            this.endLevel(informations);
        }
    }

    endLevel(levelStatistic) {
        this.UI.showStatisticsDiv(levelStatistic.servicedCustomers, levelStatistic.earnedCash,
            levelStatistic.timeUsed);
    }


    updateMoney(ammount) {
        this.moneyText.textContent = ammount;
    }

    //#################################Drag and drop###################################
    dragMoveListener(event) {

        let scaleAfterDrag = .5;

        var target = event.target
        // keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

        // translate the element
        target.style.webkitTransform =
            target.style.transform =
            `translate(${x}px,${y}px)` //scale(${scaleAfterDrag}) matrix(.5, 0, 0, .5, 0, 0)

        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    ondragenter(event) {
        var draggableElement = event.relatedTarget
        var dropzoneElement = event.target
        console.log(dropzoneElement);

        // feedback the possibility of a drop
        dropzoneElement.classList.add('customer-target')
    }
    onBinEnter(event) {
        let dropzoneElement = event.target
        dropzoneElement.classList.add('bin--active');
    }

    onBinLeave(event) {
        let dropzoneElement = event.target
        dropzoneElement.classList.remove('bin--active');
    }

    ondragleave(event) {
        // remove the drop feedback style
        event.target.classList.remove('customer-target')
        event.relatedTarget.classList.remove('burger-can-drop')
    }

    ondropdeactivate(event) {
        // remove active dropzone feedback
        event.target.classList.remove('customer-drop-active')
        event.target.classList.remove('customer-target')
    }
}