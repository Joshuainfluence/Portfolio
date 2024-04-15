var icon = document.getElementById('icon');
icon.onclick = function () {
    document.body.classList.toggle("light-theme");
    if (document.body.classList.contains("light-theme")) {
        icon.src = "SL-121222-54480-22-removebg-preview (2).png"
    } else {
        icon.src = "SL-121222-54480-22-removebg-preview (1).png"
    }
}

var hack = document.getElementById('hack');
hack.onclick = function () {
    document.body.classList.toggle("hack-theme");
    if (document.body.classList.contains("hack-theme")) {
        hack.src = "SL-121222-54480-22-removebg-preview (4).png"
    } else {
        hack.src = "SL-121222-54480-22-removebg-preview (3).png"
    }
}