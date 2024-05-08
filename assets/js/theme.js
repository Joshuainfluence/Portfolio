// var icon = document.getElementById('icon');
// icon.onclick = function () {
//     document.body.classList.toggle("light-theme");
//     if (document.body.classList.contains("light-theme")) {
//         icon.src = "SL-121222-54480-22-removebg-preview (2).png"
//     } else {
//         icon.src = "SL-121222-54480-22-removebg-preview (1).png"
//     }
// }

// var hack = document.getElementById('hack');
// hack.onclick = function () {
//     document.body.classList.toggle("hack-theme");
//     if (document.body.classList.contains("hack-theme")) {
//         hack.src = "SL-121222-54480-22-removebg-preview (4).png"
//     } else {
//         hack.src = "SL-121222-54480-22-removebg-preview (3).png"
//     }
// }

var icon = document.getElementById('theme');
var font = document.querySelector('#font');
icon.addEventListener('click', () => {
    document.body.classList.toggle('hack-theme')
    // document.header.classList.toggle('dark-theme')
    // font.classList.toggle('fa fa-sun-o')
    if (document.body.classList.contains("hack-theme")) {
        icon.innerHTML = "<i class='fa fa-moon-o' id='font'></i>";
    } else {
        icon.innerHTML = "<i class='fa fa-sun-o' id='font'></i>";
        
    }

})