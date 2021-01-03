<!DOCTYPE html>
<html lang="<?=$GLOBALS['LANG']?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta
            name="description"
            content="This application offers tools for network engineers to make IPv4 easy, smooth & flawless. One of the most obvious service is a VLSM calculator"
        />
    <!-- STYLESHEETS -->
    <link rel="stylesheet" href="/css/style.css">
    <?php if (isset($data['stylesheets_array'])): ?>
        <?php foreach ($data['stylesheets_array'] as $stylesheet_name): ?>
            <link rel="stylesheet" href="/css/<?=$stylesheet_name?>.css">
        <?php endforeach;?>
    <?php endif;?>
    <link rel="stylesheet" href="/css/fontawesome_free_5.13.0_we_all.min.css">
    <link rel="icon" href="favicon.png" type="image/png" sizes="32x32" />

    <title><?=$GLOBALS['APP_NAME'] . ' | ' . $data['title']?></title>

    <link rel="manifest" href="/manifest.json" />
     <link
        rel="apple-touch-icon"
        href="/assets/img/logo22.png"
        sizes="144x144"
    />
    <meta name="theme-color" content="#1167b1" />
</head>
<body>

<header>
    <?php if (!isset($_SESSION['id']) || empty($_SESSION['id'])): ?>
        <nav>
            <div class="max-width-container">

                <div >
                    <?=$this->nav_element("", "logo", "", "Eazy IP", "");?>
                </div>

                <div id="nav-options">
                    <?=$this->nav_element("js-nav-home", "", "", "Home", "");?>
                    <?=$this->nav_element("js-nav-about", "", "", "About", "");?>
                    <?=$this->nav_element("js-nav-contact", "", "", "Contact", "");?>
                    <?=$this->nav_element("js-nav-app", "inactive-app", "pages/app", "APP", "");?>
                </div>

            </div>
        </nav>
    <?php endif;?>
</header>


<?=$content?>


<footer>
    <div class="max-width-container">
        <div>
            <a href="/" class="logo">Eazy IP</a>
            <p>Copyright <i class="fal fa-copyright"></i>2021</p>
        </div>
        <div>
            <a href="/pages/app">APP</a>
            <a href="/">Home</a>
            <a>About</a>
            <a>Contact</a>
            <a>Support</a>
        </div>
        <div>
            <a href="https://linkedin.com/in/medilies"><i class="fab fa-linkedin fa-1x fa-2x"></i></a>
            <a href="https://github.com/medilies"><i class="fab fa-github fa-2x"></i></a>
            <a href=""><i class="fal fa-at fa-2x"></i></a>
        </div>
    </div>
</footer>

<!-- SCRIPTS -->
<script>
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
</script>

<script>
    if (window.location.pathname === "/pages/app"){
        document.querySelector("#js-nav-app").classList.add("active-app");
        document.querySelector("#js-nav-app").classList.remove("inactive-app");
    }
    else if (
        window.location.pathname === "/" ||
        window.location.pathname === "/pages" ||
        window.location.pathname === "/pages/home"
    )
        document.querySelector("#js-nav-home").classList.add("current-nav-option");
    else if (window.location.pathname === "/pages/about")
        document.querySelector("#js-nav-about").classList.add("current-nav-option");
    else if (window.location.pathname === "/pages/contact")
        document.querySelector("#js-nav-contact").classList.add("current-nav-option");
</script>

<?php if (isset($data['scripts_array'])): ?>
    <?php foreach ($data['scripts_array'] as $script_name): ?>
        <script src="/js/<?=$script_name?>.js"></script>
    <?php endforeach;?>
<?php endif;?>

</body>
</html>