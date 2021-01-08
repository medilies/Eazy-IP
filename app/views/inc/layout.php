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
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Goldman&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />

    <title><?=$GLOBALS['APP_NAME'] . ' | ' . $data['title']?></title>

    <link rel="manifest" href="/manifest.json" />
     <link
        rel="apple-touch-icon"
        href="/assets/img/logo22.png"
        sizes="144x144"
    />
    <meta name="theme-color" content="#1167b1" />
    <script data-ad-client="ca-pub-9350489272916133" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
</head>
<body>

<header>

    <nav>
        <div class="max-width-container">
            <div >
                <?=$this->nav_element("", "logo", "pages/index", "Eazy IP", "");?>
            </div>
            <div id="nav-options">
                <?=$this->nav_element("js-nav-home", "", "pages/index", "Home", "");?>
                <?=$this->nav_element("js-nav-about", "", "pages/about", "About", "");?>
                <?=$this->nav_element("js-nav-contact", "", "pages/contact", "Contact", "");?>
                <?=$this->nav_element("js-nav-app", "inactive-app", "pages/app", "APP", "");?>
            </div>
        </div>
    </nav>

</header>


<?=$content?>


<footer>
    <div class="max-width-container">
        <div>
            <a href="/pages/index" class="logo">Eazy IP</a>
            <p>Copyright <i class="fal fa-copyright"></i>2021</p>
        </div>
        <div>
            <a href="/pages/app">APP</a>
            <a href="/pages/index">Home</a>
            <a href="/pages/about">About</a>
            <a href="/pages/contact">Contact</a>
            <a href="#">Offer support</a>
        </div>
        <div>
            <a href="https://linkedin.com/in/medilies" target='_Blank'><i class="fab fa-linkedin fa-1x fa-2x"></i>/medilies</a>
            <a href="https://github.com/medilies" target='_Blank'><i class="fab fa-github fa-2x"></i>/medilies</a>
            <a href="mailto:medilies.contact@gmail.com" target='_Blank'><i class="fal fa-at fa-2x"></i>medilies.contact@gmail.com</a>
        </div>
    </div>
</footer>

<!-- SCRIPTS -->

<!-- <script src="https://cdn.jsdelivr.net/npm/darkmode-js@1.5.7/lib/darkmode-js.min.js"></script> -->

<script src="/js/index.js"></script>

<?php if (isset($data['scripts_array'])): ?>
    <?php foreach ($data['scripts_array'] as $script_name): ?>
        <script src="/js/<?=$script_name?>.js"></script>
    <?php endforeach;?>
<?php endif;?>

</body>
</html>