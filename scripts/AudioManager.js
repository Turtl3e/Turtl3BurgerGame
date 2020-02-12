class AudioManager {

    themeSong;
    addIngredientAudio;
    removeBurgerAudio;

    constructor() {
        this.addIngredientAudio = new Audio('sounds/add.mp3');
        this.removeBurgerAudio = new Audio('sounds/remove.mp3');
        this.themeSong = new Audio("sounds/themeSong.mp3");
        this.themeSong.play();
    }

    getAddIngredientAudio() {
        return this.addIngredientAudio;
    }

    getRemoveBurgerAudio() {
        return this.removeBurgerAudio;
    }
}