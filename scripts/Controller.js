class Controller {
    restaurant;
    view;
    audioManager;
    observableLevel;

    constructor() {
        this.view = new View();
        this.restaurant = new Restaurant();
        this.audioManager = new AudioManager();
        this.view.UI.showLevelDiv();
    }

    loadLevel(levelIndex) {
        this.observableLevel = this.restaurant.getObservableLevel(levelIndex - 1);
        this.view.UI.hideLevelDiv();
        this.view.UI.showReadySetGo();
        this.showAnimation();
    }

    showAnimation() {
        let redySetGoAnimation = this.view.UI.getAnimation();
        redySetGoAnimation.play();
        redySetGoAnimation.complete = () => {
            this.view.UI.hideReadySetGo();
            this.startLevel(this.observableLevel);
        }
    }

    addIngredientToBurger(ingredient) {
        this.restaurant.burger.addIngredient(ingredient);
        this.audioManager.getAddIngredientAudio().play();
        this.view.addIngredientToBurger(ingredient);
    }

    startLevel(observable) {
        observable.subscribe(
            (customer) => {
                this.view.handleSpawnCustomer(customer);
                this.startCountCustomerTimeToLeave(customer);
            },
            (error) => {
                console.log(error)
            },
            () => {
                console.log("End spawn of customers")
            }
        )
    }

    giveBurgerToCustomer(event) {
        const DOMCustomer = event.target;
        console.log("DOMCustomer", DOMCustomer);
        const occupiedSlot = DOMCustomer.children[1].dataset.occupiedSlot;
        console.log("OcupiedDOM", occupiedSlot);
        //TODO: Rename it
        const informations = this.restaurant.checkIfYouGiveCorrectBurger(occupiedSlot);
        this.view.handleGivenBurger(informations);
        this.audioManager.getRemoveBurgerAudio().play();
        console.log(informations);
    }

    startCountCustomerTimeToLeave(customer) {
        let progressBar = this.view.customersManager.getCustomerProgressBar(customer.occupiedSlot);
        let interval = setInterval(() => {
            customer.progressTime -= customer.subtractionValue;
            progressBar.style.width = customer.progressTime + "%";
            if (customer.progressTime <= 0) {
                clearInterval(interval);
                this.removeCustomer(customer);
            }
        }, 1000)
    }

    removeCustomer(customer) {
        let informations = this.restaurant.handleRemoveCustomer(customer);
        this.view.handleRemoveCustomer(informations);

    }
}

const controller = new Controller();

//############## Drag and drop
interact('.burger')
    .draggable({
        // enable inertial throwing
        inertia: true,
        // keep the element within the area of it's parent
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: document.querySelector('.restaurant'),
                endOnly: true
            })
        ],
        // enable autoScroll
        autoScroll: false,
        // call this function on every dragmove event
        onmove: controller.view.dragMoveListener,
        // call this function on every dragend event
        onend: function (event) {
            let burgerDiv = event.target;
            console.log("Puszczam");
        }
    })

interact('.customer').dropzone({
    // only accept elements matching this CSS selector
    accept: '.burger',
    // Require a 75% element overlap for a drop to be possible
    overlap: 0.2,
    // listen for drop related events:
    /* ondropactivate: controller.view.ondropactivate, */
    ondragenter: controller.view.ondragenter,
    ondragleave: controller.view.ondragleave,
    ondrop: controller.giveBurgerToCustomer.bind(controller),
    ondropdeactivate: controller.view.ondropdeactivate
})

interact('.bin').dropzone({
    accept: '.burger',
    overlap: 0.0001,
    ondragenter: controller.view.onBinEnter,
    ondragleave: controller.view.onBinLeave,
    ondrop: (e) => {
        controller.restaurant.removeBurger();
        controller.audioManager.getRemoveBurgerAudio().play();
        controller.view.burgerManager.removeBurger(e);
    }
})