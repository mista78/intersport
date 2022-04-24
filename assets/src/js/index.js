import { calls, selector } from "./tools/helpers";
import Slider from './tools/slider';

calls("herobanner", block => {
    const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;
    console.log(block);
    let countDown = new Date('10 may 2022 00:00:00').getTime(),
        x = setInterval(function () {

            
            let now = new Date(),
            distance = countDown - now;
            const time = {
                days: Math.floor(distance / (day)),
                hours: Math.floor((distance % (day)) / (hour)),
                minutes: Math.floor((distance % (hour)) / (minute)),
                seconds: Math.floor((distance % (minute)) / second)
            }
            const [days,hours,minutes,seconds] = selector("#days, #hours, #minutes, #seconds");
            days.innerHTML = time.days < 10 ? '0' + time.days : time.days;
            hours.innerHTML = time.hours < 10 ? '0' + time.hours : time.hours;
            minutes.innerHTML = time.minutes < 10 ? '0' + time.minutes : time.minutes;
            seconds.innerHTML = time.seconds < 10 ? '0' + time.seconds : time.seconds;  

            if (distance < 1) {
                clearInterval(x);
            }

        }, second);
})

calls("Productgrid", block => {
    const carousel = selector(`#${block}__carousel`);
    carousel.map(item => {
        const carous = new Slider(item);
    });
});

calls("Producthero", block => {
    const carousel = selector(`#${block}__carousel`);
    carousel.map(item => {
        const carous = new Slider(item);
    });
});

calls("menu", block => {
    const [submenu] = selector(`#Submenu`);
    const children = selector(`#Submenu a`, submenu);
    const reducer = (prev, current) => prev + current;
    const size = children.map(item => Math.round(item.getBoundingClientRect().width + 26));
    const width = size.reduce(reducer);
    submenu.style.width = `${width}px`;
    children.map((item) => item.addEventListener('click', (e) => {
        const mobileOnly = window.matchMedia("(max-width: 767px)");
        if (mobileOnly.matches) {
            const itemleft = e.target.getBoundingClientRect().left;
            const submenuleft = submenu.getBoundingClientRect().left;
            const left = (itemleft - submenuleft) / 2;
            submenu.style.transform = `translateX(-${left}px)`;
        }
        children.map(item => item.classList.remove('active'));
        e.target.classList.add('active');
    }));
});