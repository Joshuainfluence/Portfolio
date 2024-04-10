var typed = new Typed(".multiple-text", {
    strings: ["Full Stack Developer", "Mobile App Developer", "Cybersecurity Ethusiast", "Computer Science Student", "Youtuber"],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
})

// link https://github.com/mattboldt/typed.js


const btn = document.getElementById("menu-btn")
const nav = document.getElementById("menu")

btn.addEventListener('click', () => {
    btn.classList.toggle('open')
    nav.classList.toggle('visibility')
    nav.classList.toggle('hidden')

})
