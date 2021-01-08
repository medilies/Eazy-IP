//*******************************************************
// register service worker
//*******************************************************
// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker
//         .register("/sw.js")
//         .then(function () {
//             console.log("Service worker registered!");
//         })
//         .catch(function (err) {
//             console.error(err);
//         });
// }

//*******************************************************
// nav bar
//*******************************************************
if (window.location.pathname === "/pages/app") {
    document.querySelector("#js-nav-app").classList.add("active-app");
    document.querySelector("#js-nav-app").classList.remove("inactive-app");
} else if (
    window.location.pathname === "/" ||
    window.location.pathname === "/pages" ||
    window.location.pathname === "/pages/index"
)
    document.querySelector("#js-nav-home").classList.add("current-nav-option");
else if (window.location.pathname === "/pages/about")
    document.querySelector("#js-nav-about").classList.add("current-nav-option");
else if (window.location.pathname === "/pages/contact")
    document
        .querySelector("#js-nav-contact")
        .classList.add("current-nav-option");

//*******************************************************
// darkmode.js
//*******************************************************
// function addDarkmodeWidget() {
//     new Darkmode().showWidget();
// }
// window.addEventListener("load", addDarkmodeWidget);

//*******************************************************
// record visit
//*******************************************************
if (sessionStorage.getItem("visit") !== "recorded") {
    fetch(`${window.location.origin}/apis/visit`)
        .then((res) => {
            // console.log(res);

            if (res.status === 200) {
                return res.text();
            } else {
                throw "server err";
            }
        })
        .then((content) => {
            // console.log(content);

            if (content === "recorded")
                sessionStorage.setItem("visit", content);
            else throw "backend err";
        })
        .catch((err) => {
            sessionStorage.setItem("visit", err);
        });
}
