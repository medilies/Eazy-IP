const contactForm = document.querySelector("#contact-form");

contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);

    // const name = formData.get("name");
    // const email = formData.get("email");
    // const msg = formData.get("msg");

    fetch(`${window.location.origin}/apis/contact`, {
        method: "post",
        body: formData,
    })
        .then((res) => res.text())
        .then((text) => {
            console.log(text);
        });
});
