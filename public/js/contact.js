const contactForm = document.querySelector("#contact-form");
const contactMsgStatus = document.querySelector("#contact-msg-status");

contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);

    // const name = formData.get("name");
    // const email = formData.get("email");
    // const msg = formData.get("msg");

    // disable sending for a while
    fetch(`${window.location.origin}/apis/contact`, {
        method: "post",
        body: formData,
    })
        .then((res) => res.text())
        .then((text) => {
            if (text === "nice msg") {
                contactMsgStatus.innerHTML =
                    "<p class='success-text'>We recieved your message. Thank you :)</p>";
            } else if (text === "ownonono") {
                contactMsgStatus.innerHTML =
                    "<p class='alarming-text'>A server error happened! please try another medium to pass your massege (An email maybe)</p>";
                //
            }
        });
});
