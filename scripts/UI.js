class UI {
    levelsDiv;
    statisticsDiv;

    //for statistic screen
    statisticServicedCustomers;
    statisticEarnedMoney;
    statisticTime;
    readySetGoDiv;
    readySetGoAnimation

    constructor() {
        this.levelsDiv = document.querySelector('.levels');
        this.statisticsDiv = document.querySelector('.statistics');
        this.statisticServicedCustomers = document.querySelector('.statistic__number--customers');
        this.statisticEarnedMoney = document.querySelector('.statistic__number--coins');
        this.statisticTime = document.querySelector('.statistic__number--clock');
        this.readySetGoDiv = document.querySelector('.ready-set-go-container');
    }

    showLevelDiv() {
        this.levelsDiv.classList.add('levels--show');
    }

    hideLevelDiv() {
        this.levelsDiv.classList.remove('levels--show');
    }

    showStatisticsDiv(servicedCustomers, earnedCoins, time) {
        this.statisticServicedCustomers.textContent = servicedCustomers;
        this.statisticEarnedMoney.textContent = earnedCoins;
        this.statisticTime.textContent = `${Math.floor(time/60)}:${Math.floor(time%60)}s`;
        this.statisticsDiv.classList.add('statistics--show');
    }

    hideStatisticsDiv() {
        this.statisticsDiv.classList.remove('statistics--show');
    }

    showReadySetGo() {
        this.readySetGoDiv.classList.add('ready-set-go-container--show');
    }
    hideReadySetGo() {
        this.readySetGoDiv.classList.remove('ready-set-go-container--show');
    }

    getAnimation() {
        return anime.timeline({
                loop: false,
                duration: 1500,
                autoplay: false,
            })
            .add({
                targets: '.ready-set-go__letters-1',
                opacity: [0, 1],
                scale: [0.2, 1],
                duration: 800
            }).add({
                targets: ' .ready-set-go__letters-1',
                opacity: 0,
                scale: 3,
                duration: 600,
                easing: "easeInExpo",
                delay: 500
            }).add({
                targets: ' .ready-set-go__letters-2',
                opacity: [0, 1],
                scale: [0.2, 1],
                duration: 800
            }).add({
                targets: ' .ready-set-go__letters-2',
                opacity: 0,
                scale: 3,
                duration: 600,
                easing: "easeInExpo",
                delay: 500
            }).add({
                targets: ' .ready-set-go__letters-3',
                opacity: [0, 1],
                scale: [0.2, 1],
                duration: 800
            }).add({
                targets: ' .ready-set-go__letters-3',
                opacity: 0,
                scale: 3,
                duration: 600,
                easing: "easeInExpo",
                delay: 500
            }).add({
                targets: '.ready-set-go__letters',
                opacity: 0,
                duration: 500,
                delay: 500
            });
    }
}